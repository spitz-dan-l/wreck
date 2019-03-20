from dataclasses import dataclass, field
from typing import List, Tuple, Optional
from collections import deque

import re

@dataclass
class Token:
    text: str
    trailing_whitespace: str = field(default=' ')

    def is_null(self):
        return self.text == ''

@dataclass
class PhraseSpec:
    tokens: List[Token]

    def _gulp(self):
        return '_'.join(t.text for t in self.tokens)

    def __repr__(self):
        return 'PhraseSpec<{}>'.format(self._gulp())

    def is_null(self):
        return len(self.tokens) == 1 and self.tokens[0].is_null()

@dataclass
class CommandSpec:
    phrases: List[PhraseSpec]

    def _gulp(self):
        return ' '.join(p._gulp() for p in self.phrases)

    def __repr__(self):
        return 'CommandSpec<{}>'.format(self._gulp())

def parse_command_spec(txt):
    ts = tokenize(txt)

    result = []
    for t in ts:
        p_toks = []
        for p_tok in tokenize(t.text.replace('_', ' ')):
            p_toks.append(p_tok)
        p_toks[-1].trailing_whitespace = t.trailing_whitespace
        result.append(PhraseSpec(p_toks))

    return CommandSpec(result)

@dataclass
class PhraseMatch:
    phrase_spec: PhraseSpec

    whole_matches: List[Token]
    partial_match: Optional[Token]
    error_match: Optional[List[Token]]

    def validity(self):
        if self.error_match is not None:
            return 'invalid'

        if self.partial_match is not None:
            return 'partial'

        return 'valid'

    def validity_at(self, tok_pos):
        if tok_pos < len(self.whole_matches):
            return 'valid'
        if tok_pos == len(self.whole_matches) and self.partial_match is not None:
            return 'partial'
        return 'invalid'

    def __len__(self):
        result = len(self.whole_matches)
        if self.partial_match is not None:
            result += 1
        if self.error_match is not None:
            result += len(self.error_match)
        return result

@dataclass
class CommandMatch:
    command_spec: CommandSpec

    whole_matches: List[PhraseMatch]
    partial_match: Optional[PhraseMatch] = field(default=None)
    error_match: Optional[PhraseMatch] = field(default=None)

    def validity(self):
        if self.error_match is not None:
            return 'invalid'

        if self.partial_match is not None:
            return 'partial'

        return 'valid'

    def validity_at(self, tok_pos):
        pm, i = self.phrase_match_at(tok_pos)

        if pm is None:
            return 'invalid'

        return pm.validity_at(i)


        valid_pos = sum(map(len, self.whole_matches))
        if tok_pos < valid_pos:
            return 'valid'

        if self.partial_match is not None:
            partial_pos = valid_pos + len(self.partial_match)
        else:
            partial_pos = valid_pos

        if tok_pos < partial_pos:
            return 'partial'

        return 'invalid'

    def phrase_match_at(self, tok_pos):
        valid_pos = sum(map(len, self.whole_matches))
        if tok_pos < valid_pos:
            i = 0
            for whole_match in self.whole_matches:
                if tok_pos < i + len(whole_match):
                    return whole_match, tok_pos - i
                i += len(whole_match)

        if self.partial_match is not None:
            partial_pos = valid_pos + len(self.partial_match)
        else:
            partial_pos = valid_pos

        if tok_pos < partial_pos:
            return self.partial_match, tok_pos - valid_pos

        if self.error_match is not None:
            error_pos = partial_pos + len(self.error_match)

            if tok_pos < error_pos:
                return self.error_match, tok_pos - partial_pos

        return None, None

    def __len__(self):
        result = len(self.whole_matches)
        if self.partial_match is not None:
            result += len(self.partial_match)
        if self.error_match is not None:
            result += len(self.error_match)

        return result


@dataclass
class MatchResult:
    token_displays: List[Tuple[Token, str]]
    autocomplete_options: List[List[Token]]
    typeahead_option: List[Token]

@dataclass
class MatchSet:
    concrete_matches: List[CommandMatch]

@dataclass
class Parser:
    input_tokens: List[Token]

def tokenize(txt):
    result = []

    for m in re.finditer(r'(\S+)(\s*)', txt):
        result.append(Token(m.group(1), m.group(2)))

    return result

def match_command(c_spec, toks):
    whole_matches = []
    partial_match = None
    error_match = None

    for p_spec in c_spec.phrases:
        p_match = match_phrase(p_spec, toks)

        v = p_match.validity()
        if v == 'valid':
            whole_matches.append(p_match)
            continue
        elif v == 'partial':
            partial_match = p_match
            break
        else: # invalid
            error_match = p_match
            break

    # if tokens left over
    if toks:
        if error_match is None:
            error_match = match_phrase(PhraseSpec([Token('', '')]), toks)
        else:
            raise Exception("this shouldn't happen")

    return CommandMatch(c_spec, whole_matches, partial_match, error_match)

def match_phrase(p_spec, toks):
    match = []
    partial = None
    error = None

    tok_pos = 0
    for t_spec in p_spec.tokens:
        if tok_pos >= len(toks):
            partial = []
            break
        tok = toks.popleft()

        tm = match_token(t_spec, tok)
        if tm == 'valid':
            match.append(tok)
        else:
            if tm == 'partial':
                partial = tok
            else: # invalid
                error = [tok]

            if toks:
                if error is None:
                    error = []

                while toks:
                    error.append(toks.popleft())
            break

    return PhraseMatch(p_spec, match, partial, error)

def match_token(t_spec, tok):
    t1 = t_spec.text.lower()
    t2 = tok.text.lower()

    if t1 == t2:
        return 'valid'

    if t1.startswith(t2) and tok.trailing_whitespace == '':
        return 'partial'

    return 'invalid'


def match(c_spec, txt):
    toks = deque(tokenize(txt))

    return match_command(c_spec, toks)

def combine_matches(cmd_matches, toks):
    display = []

    for i, tok in enumerate(toks):
        candidates = [cm for cm in cmd_matches if cm.validity_at(i - 1) != 'invalid']
        pms = [cm.phrase_match_at(i) for cm in candidates]

        if len(candidates) == 0:
            display.append((tok, 'error'))
            continue

        validities = [cm.validity_at(i) for cm in candidates]

        # no candidates are valid -> partial
        if all(v == 'partial' for v in validities):
            display.append((tok, 'partial'))
            continue

        unique_pms = []

        for pm, i in pms:
            spec = pm.phrase_spec
            if not spec.is_null() and (spec, i) not in unique_pms:
                unique_pms.append((spec, i))
        
        if any(v == 'valid' for v in validities):
            if len(unique_pms) == 1:
                display.append((tok, 'filler'))
            else:
                display.append((tok, 'option'))
        elif any(v == 'partial' for v in validities):
            display.append((tok, 'partial'))
        else:
            display.append((tok, 'error'))
    
    # TODO: need to add next phrase into typeahead pms IF the command match up to this point is valid
    # TODO: maybe just add a get_typeahead() method to CommandMatch? It seems fully determinable from the spec and the input
    typeahead_pms = [pm for pm in pms if pm[0].validity() == 'partial']
    # typeahead_options = 

    import pdb; pdb.set_trace()
    return display

def test_command(txt_specs, input_txt, final_only=False):
    cmd_specs = [parse_command_spec(t) for t in txt_specs]

    combined_results = []

    if final_only:
        r = [len(input_txt)]
    else:
        r = range(len(input_txt) + 1)
    
    for i in r:
        txt = input_txt[:i]
        txt_results = []
        for cmd_spec in cmd_specs:
            m = match(cmd_spec, txt)

            txt_results.append(m)
    
        comb_res = combine_matches(txt_results, tokenize(txt))
        combined_results.append((txt, comb_res))

    return combined_results

"""
TODO: Split tree based parser api


A "Parser" has a consumer function and a deque of input tokens
and produces a list of command matches
"""
if __name__ == '__main__':
    txt_specs = [
        'look at me',
        'look at me go',
        'look at_mewtwo steve 1',
        'look at mewtwo_steve 2'
    ]

    input_txt = 'look at me'
    # input_txt = 'agdgwengo horse milkd'

    combined_results = test_command(txt_specs, input_txt, final_only=True)


    # Niney test

    n_specs = [
        'be the one who gazes ahead',
        'be the one who gazes back',
        'be the one who gazes up',
        'be the one who gazes down',
        'be the one whose palms are open',
        'be the one whose palms are closed',
        'be the one who seduces',
        'be the one who is seduced',
        'be the one who is strong',
        'be the one who is weak'
    ]

    input_txt = 'be the one who gaz'

    combined_results = test_command(n_specs, input_txt, final_only=True)
