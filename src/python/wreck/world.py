from wreck import box_geometry
from wreck.datatypes import Item, EdgeState, CardboardEdge, TapeEdge, SpillageLevel, Rend, Weight
import wreck.text_tools as tt

from collections import defaultdict, Counter
import abc
from contextlib import contextmanager

class WreckException(Exception):
    pass

class CommandException(WreckException):
    pass

class WorldUpdateException(WreckException):
    pass

world_update_effects = None #using global to manage any side effects from world updates

class WorldUpdateEffects:
    def __init__(self):
        self.spill_directions = []
        self.spilled_items = []
        self.spilled_rends = set()
        self.spilled_dangles = set()
        self.spillage_level = SpillageLevel.none
        self.taken_items = []
        self.new_rends = []
        self.new_dangles = []
        self.repaired_rends = []
        self.repaired_dangles = []
        self.box_collapsed = False
        self.collapse_spilled_items = []

@contextmanager
def world_update():
    global world_update_effects
    if world_update_effects is not None:
        raise RuntimeError('tried to start a world update before the previous one finished')

    wue = world_update_effects = WorldUpdateEffects()
    try:
        yield wue
    finally:
        world_update_effects = None

"""
Tarot cards, linking rings, a false mirror, a blindfold
The Key to the City [what does it open: the city hall, the mayor’s mansion?], a passport, a paramilitary police badge, lottery tickets
The memoir of Lincoln Rockefeller [name of memoir?], a codex [unintelligible, but is it tinged with, or does it suggest, a particular cultural area?], an early sci-fi story [name of story, name of author, and general plot], a fairytale [name of publisher, name of fairytale, cultural origin of fairytale, and general plot]
A noose, a melted wax figure, a skull, an hourglass
"""

class Codex(Item):
    def weight(self):
        return Weight.medium

    def name(self):
        return 'codex'

    def pre_gestalt(self):
        return 'something thick and aged'

    def post_gestalt(self):
        return 'a thick, rotten codex with strange markings on the front'

class CityKey(Item):
    def weight(self):
        return Weight.light

    def name(self):
        return 'Key to the City'

    def pre_gestalt(self):
        return 'something glistening and golden'

    def post_gestalt(self):
        return 'a large, heavy golden key'

    def article(self):
        return 'the'

class Pinecone(Item):
    def weight(self):
        return Weight.very_light

    def name(self):
        return 'pinecone'

    def pre_gestalt(self):
        return 'something small, brown and flaky'

    def post_gestalt(self):
        return 'a small, brown pinecone that smells of the outdoors'


class Box:
    def __init__(self, box_mesh=None, rend_state=None, dangle_state=None, edge_state=None, contents=None):
        if box_mesh is None:
            box_mesh = box_geometry.BoxMesh((2,2,2))
        self.box_mesh = box_mesh

        if rend_state is None:
            rend_state = self.default_rend_state(self.box_mesh)
        self.rend_state = rend_state

        if dangle_state is None:
            dangle_state = self.default_dangle_state(self.box_mesh)
        self.dangle_state = dangle_state

        if edge_state is None:
            edge_state = defaultdict(EdgeState)
        self.edge_state = edge_state

        if contents is None:
            contents = []
        self.contents = contents

    def copy(self):
        return self.update()

    def update(self, box_mesh=None, rend_state=None, dangle_state=None, edge_state=None, contents=None):
        if box_mesh is None:
            box_mesh = self.box_mesh.copy()

        if rend_state is None:
            rend_state = self.rend_state.copy()

        if dangle_state is None:
            dangle_state = self.dangle_state.copy()

        if edge_state is None:
            edge_state = self.edge_state.copy()

        if contents is None:
            contents = self.contents[:]

        return Box(box_mesh, rend_state, dangle_state, edge_state, contents)

    def default_rend_state(self, box_mesh):
        rends = box_mesh.get_free_rends()
        return {r: Rend.closed for r in rends}

    def default_dangle_state(self, box_mesh):
        dangles = box_mesh.get_dangles()
        return {d: Rend.closed for d in dangles}

    def open_or_close_rend(self, operation, rend):
        """Set the rend to removed or set it to in-place"""
        global world_update_effects

        if operation not in ['open', 'close']:
            raise ValueError('operation must be open or close')

        box_rends = self.box_mesh.get_rends()

        if rend not in box_rends:
            raise ValueError('rend does not exist on the box')

        if self.box_mesh.is_partition_fixed(rend):
            raise WorldUpdateException('cannot open or close a fixed rend')

        new_rend_state = self.rend_state.copy()
        intended_new_state = Rend.closed if operation == 'close' else Rend.open
        if intended_new_state == new_rend_state[rend]:
            raise WorldUpdateException('cannot {} a rend that is already {}'.format(operation, intended_new_state))

        new_rend_state[rend] = intended_new_state

        new_box = self.update(rend_state=new_rend_state)

        if new_box.is_collapsed():
            world_update_effects.box_collapsed = True
            world_update_effects.collapse_spilled_items.extend(new_box.contents)
            new_contents = []
            new_box = new_box.update(contents=new_contents)

        return new_box

    def open_or_close_dangle(self, operation, dangle):
        """Set the dangle to "swung open" or "swung shut"."""
        global world_update_effects

        if operation not in ['open', 'close']:
            raise ValueError('operation must be open or close')

        if self.box_mesh.is_partition_fixed(dangle.partition):
            raise WorldUpdateException('cannot open or close a fixed dangle')

        box_dangles = self.box_mesh.get_dangles()

        if not any(dangle == d for d in box_dangles):
            raise ValueError('dangle does not exist on the box')
        
        new_dangle_state = self.dangle_state.copy()
        intended_new_state = Rend.closed if operation == 'close' else Rend.open
        
        if new_dangle_state[dangle] == intended_new_state:
            raise WorldUpdateException('cannot {} a dangle that is already {}'.format(operation, intended_new_state))

        new_dangle_state[dangle] = intended_new_state
        

        new_box = self.update(dangle_state=new_dangle_state)

        if new_box.is_collapsed():
            world_update_effects.box_collapsed = True
            world_update_effects.collapse_spilled_items.extend(new_box.contents)
            new_contents = []
            new_box = new_box.update(contents=new_contents)

        return new_box

    def rotate_y(self, degrees):
        new_box_mesh = self.box_mesh.rotate_y(degrees)
        return self.update(box_mesh=new_box_mesh)

    def roll(self, direction):
        global world_update_effects

        if any(state == Rend.open for state in self.dangle_state.values()):
            raise WorldUpdateException('cannot roll a box with open dangles')

        new_box_mesh = self.box_mesh.roll(direction)

        new_contents = self.contents[:]
        rend_state_updates = self.rend_state.copy()
        dangle_state_updates = self.dangle_state.copy()

        if len(new_contents) > 0:
            dir_2_opposite = {'n': 's', 's': 'n', 'e': 'w', 'w': 'e'}
            heavy_spill_directions = [(direction, 'b'), ('t', direction), ('b', dir_2_opposite[direction])]
            light_spill_directions = [d for d in ['n', 's', 'e', 'w']
                                     if d not in [direction, dir_2_opposite[direction]]]

            for r, state in self.rend_state.items():
                face_membership = self.box_mesh.get_partition_face_membership(r)
                
                for test_direction, spill_direction in heavy_spill_directions:
                    if face_membership[test_direction] > 0:
                        world_update_effects.spill_directions.append(spill_direction)
                        world_update_effects.spillage_level = SpillageLevel.heavy
                        world_update_effects.spilled_items.extend(new_contents)
                        new_contents = []

                        if state == Rend.closed:
                            world_update_effects.spilled_rends.add(r)
                            rend_state_updates[r] = Rend.open

                for spill_direction in light_spill_directions:
                    if face_membership[spill_direction] > 0:
                        world_update_effects.spill_directions.append(spill_direction)
                        if world_update_effects.spillage_level < SpillageLevel.light:
                            world_update_effects.spillage_level = SpillageLevel.light
                        if new_contents:
                            world_update_effects.spilled_items.append(new_contents.pop()) #single item spills


            for d in self.box_mesh.get_dangles():
                spillage_level = SpillageLevel.none
                if d.free_face == 't':
                    spillage_level = SpillageLevel.heavy
                    spill_direction = direction
                elif d.free_face == direction:
                    spillage_level = SpillageLevel.heavy
                    spill_direction = 'b'
                elif d.free_face in light_spill_directions:
                    spillage_level = SpillageLevel.light
                    spill_direction = d.free_face

                if spilled_dangle:
                    if spillage_level > world_update_effects.spillage_level:
                        world_update_effects.spillage_level = spillage_level
                    world_update_effects.spill_directions.append(spill_direction)
                    
                    if spillage_level == SpillageLevel.light:
                        if new_contents:
                            world_update_effects.spilled_items.append(new_contents.pop())
                    elif spillage_level == SpillageLevel.heavy:
                        world_update_effects.spilled_items.extend(new_contents)
                        new_contents = []
                    
                    world_update_effects.spilled_dangles.add(d)
                    dangle_state_updates[d] = Rend.open

            for d in new_box_mesh.get_dangles():
                if d.free_face == dir_2_opposite[direction]:
                    world_update_effects.spillage_level = SpillageLevel.heavy
                    world_update_effects.spill_directions.append(dir_2_opposite[direction])
                    
                    world_update_effects.spilled_items.extend(new_contents)
                    new_contents = []
                    
                    world_update_effects.spilled_dangles.add(d)
                    dangle_state_updates[d] = Rend.open

        new_rend_state = rend_state_updates
        new_dangle_state = dangle_state_updates

        new_box = self.update(box_mesh=new_box_mesh, rend_state=new_rend_state, dangle_state=new_dangle_state, contents=new_contents)

        if new_box.is_collapsed():
            world_update_effects.box_collapsed = True
            world_update_effects.collapse_spilled_items.extend(new_contents)
            new_contents = []
            new_box = new_box.update(contents=new_contents)

        return new_box

    def lift(self):
        global world_update_effects

        new_contents = self.contents[:]
        new_rend_state = self.rend_state.copy()
        new_dangle_state = self.dangle_state.copy()

        if len(new_contents) > 0:
            #flip and over and look for dangles on top since dangles on the bottom aren't detected
            test_box_mesh = self.box_mesh.roll('s').roll('s')

            for r in test_box_mesh.get_free_rends():
                face_membership = test_box_mesh.get_partition_face_membership(r)
                if face_membership['t'] > sum(map(face_membership.get, ['b', 'n', 's', 'e', 'w'])):
                    world_update_effects.spillage_level = SpillageLevel.heavy
                    world_update_effects.spill_directions.append('b')

                    world_update_effects.spilled_items.extend(new_contents)
                    new_contents = []

                    if new_rend_state.get(r, Rend.closed) == Rend.closed:
                        world_update_effects.spilled_rends.add(r)
                        new_rend_state[r] = Rend.open

            for d in test_box_mesh.get_dangles():
                if d.free_face == 't':
                    world_update_effects.spillage_level = SpillageLevel.heavy
                    world_update_effects.spill_directions.append('b')
                    
                    world_update_effects.spilled_items.extend(new_contents)
                    new_contents = []
                    
                    world_update_effects.spilled_dangles.add(d)
                    new_dangle_state[d] = Rend.open

            for r, state in self.rend_state.items():
                face_membership = self.box_mesh.get_partition_face_membership(r)
                light_spill_directions = [d for d in ['n', 'e', 's', 'w'] if face_membership[d] > 0]
                if light_spill_directions:
                    if world_update_effects.spillage_level < SpillageLevel.light:
                        world_update_effects.spillage_level = SpillageLevel.light
                    world_update_effects.spill_directions.extend(light_spill_directions)

                    if new_contents:
                        world_update_effects.spilled_items.append(new_contents.pop())
                    if state == Rend.closed:
                        world_update_effects.spilled_rends.add(r)
                        new_rend_state[r] = Rend.open

            for d, state in self.dangle_state.items():
                if d.free_face in ['n', 'e', 's', 'w']:
                    if world_update_effects.spillage_level < SpillageLevel.light:
                        world_update_effects.spillage_level = SpillageLevel.light
                    world_update_effects.spill_directions.extend(d.free_face)

                    if new_contents:
                        world_update_effects.spilled_items.append(new_contents.pop())
                    if state == Rend.closed:
                        world_update_effects.spilled_dangles.add(d)
                        new_dangle_state[d] = Rend.open

        new_box = self.update(rend_state=new_rend_state, dangle_state=new_dangle_state, contents=new_contents)
        if new_box.is_collapsed():
            world_update_effects.box_collapsed = True
            world_update_effects.collapse_spilled_items.extend(new_contents)
            new_contents = []
            new_box = new_box.update(contents=new_contents)
        
        return new_box

    def cut(self, face, start, end):
        return self.cut_or_tape('cut', face, start, end)

    def tape(self, face, start, end):
        return self.cut_or_tape('tape', face, start, end)

    def cut_or_tape(self, operation, face, start, end):
        global world_update_effects

        if operation not in ['cut', 'tape']:
            raise ValueError('operation must be cut or tape')

        if face not in ['s', 't']:
            raise WorldUpdateException('cannot cut or tape sides other than s or t')

        v1 = self.box_mesh.faces[face].vertices[start]
        v2 = self.box_mesh.faces[face].vertices[end]

        if v2 < v1:
            edge = (v2, v1)
        else:
            edge = (v1, v2)

        quadrants = box_geometry.edge_2_quadrants[edge]

        for r, state in self.rend_state.items():
            if state == Rend.open and all(q in r for q in quadrants):
                raise WorldUpdateException('cannot cut or tape on an open rend')      

        for d, state in self.dangle_state.items():
            if state == Rend.open and all(q in d.partition for q in quadrants):
                raise WorldUpdateException('cannot cut or tape on an open dangle')          

        if operation == 'cut':
            new_box_mesh = self.box_mesh.cut(face, start, end)
        else:
            new_box_mesh = self.box_mesh.tape(face, start, end)

        new_rend_state = self.default_rend_state(new_box_mesh)
        for r, state in self.rend_state.items():
            if r in new_rend_state:
                new_rend_state[r] = state
            else:
                world_update_effects.repaired_rends.append(r)

        for new_r in new_rend_state:
            if new_r not in self.rend_state:
                world_update_effects.new_rends.append(new_r)

        new_dangle_state = self.default_dangle_state(new_box_mesh)
        for d, state in self.dangle_state.items():
            if d in new_dangle_state:
                new_dangle_state[d] = state
            else:
                world_update_effects.repaired_dangles.append(d)

        for new_d in new_dangle_state:
            if new_d not in self.dangle_state:
                world_update_effects.new_dangles.append(new_d)

        new_edge_state = self.edge_state.copy()
        if operation == 'cut':
            new_edge_state[edge] = new_edge_state[edge].cut()
        else:
            new_edge_state[edge] = new_edge_state[edge].apply_tape()

        return self.update(new_box_mesh, new_rend_state, new_dangle_state, new_edge_state)

    def take_next_item(self):
        global world_update_effects

        if len(self.contents) == 0:
            raise WorldUpdateException('cannot take an item from an empty box')


        if not self.appears_open():
            raise WorldUpdateException('cannot take an item from a box with no visible openings')

        new_contents = self.contents[:]
        world_update_effects.taken_items.append(new_contents.pop())
        return self.update(contents=new_contents)

    def next_item(self):
        if len(self.contents) == 0:
            return None

        return self.contents[-1]

    def appears_open(self):
        if any(state == Rend.open for state in self.rend_state.values()):
            return True
        if any(state == Rend.open for state in self.dangle_state.values()):
            return True
        return False

    def appears_empty(self):
        return self.appears_open() and len(self.contents) == 0

    def is_collapsed(self):
        open_faces = Counter()

        for r, state in self.rend_state.items():
            if state == Rend.open:
                face_membership = self.box_mesh.get_partition_face_membership(r)
                open_faces.update(face_membership)

        for d, state in self.dangle_state.items():
            if state == Rend.open:
                face_membership = self.box_mesh.get_partition_face_membership(d.partition)
                open_faces.update(face_membership)

        total_open_sides = sum(1 for f in ['n', 's', 'e', 'w'] if open_faces[f] > 0)
        return total_open_sides >= 3

class FaceContents:
    def description(self, rotation):
        raise NotImplementedError()

class BlankContents:
    def description(self, rotation):
        return 'A blank face.'

class TextContents(FaceContents):
    def __init__(self, text):
        self.text = text

    def description(self, rotation):
        if rotation == 0:
            orient_description = '.'
        elif rotation == 1:
            orient_description = ' reads sideways from top to bottom.'
        elif rotation == 2:
            orient_description = ' reads upside-down from right to left.'
        elif rotation == 3:
            orient_description = ' reads sideways from bottom to top.'

        return '"{}"{}'.format(self.text, orient_description)

class FlapContents(FaceContents):
    def __init__(self, lifted=False):
        self.lifted=lifted

    def description(self, rotation):
        pass


class SingleBoxWorld:
    def __init__(self, box=None, taken_items=None, spilled_items=None):
        if box is None:
            box = Box()
        self.box = box

        if taken_items is None:
            taken_items = []
        self.taken_items = taken_items

        if spilled_items is None:
            spilled_items = []
        self.spilled_items = spilled_items

    def update(self, box=None, taken_items=None, spilled_items=None):
        if box is None:
            box = self.box.copy()

        if taken_items is None:
            taken_items = self.taken_items[:]

        if spilled_items is None:
            spilled_items = self.spilled_items[:]

        return SingleBoxWorld(box, taken_items, spilled_items)

    def copy(self):
        return self.update()

    def command_rotate_y_box(self, cmd):
        if cmd not in ['left', 'right']:
            raise CommandException('direction must be left or right. got {}'.format(cmd))

        degrees = 90 if cmd == 'right' else 270
        
        new_box = self.box.rotate_y(degrees)
        new_world = self.update(box=new_box)

        message = 'You turn the box 90 degrees to the {}.'.format(cmd)

        return new_world, message

    def command_roll_box(self, cmd):
        with world_update() as world_update_effects:
            if cmd not in ['forward', 'backward', 'left', 'right']:
                raise CommandException('direction must be forward, back, left or right. got {}'.format(cmd))

            cmd_2_direction = {
                'forward': 'n',
                'backward': 's',
                'left': 'w',
                'right': 'e'
            }

            direction = cmd_2_direction[cmd]

            new_box = self.box.roll(direction)

            dir_msg = ('over to the {}' if cmd in ['left', 'right'] else '{}').format(cmd)

            if world_update_effects.spillage_level == SpillageLevel.none:
                message = 'You roll the box {}.'.format(dir_msg)
                new_world = self.update(box=new_box)
            else:
                spill_msg = tt.uncapitalize(self.spill_message(new_box))
                message = 'As you roll the box {}, {}'.format(dir_msg, spill_msg)

                new_world = self.update(box=new_box, spilled_items=world_update_effects.spilled_items)

            if world_update_effects.box_collapsed:
                message += '\nThe added stress on the box causes it to collapse in on itself.'
                if world_update_effects.collapse_spilled_items:
                    message += ' {}'.format(self.item_spill_message(world_update_effects.collapse_spilled_items))

            return new_world, message

    def command_lift_box(self):
        with world_update() as world_update_effects:
            new_box = self.box.lift()

            weight_msg = ''
            if world_update_effects.spillage_level <= SpillageLevel.heavy and not world_update_effects.box_collapsed:
                total_weight = sum(i.weight() for i in new_box.contents)
                total_weight = total_weight // 2.9 #rule of thumb for translating "normal item weights" to "normal box weights"
                if total_weight > Weight.very_heavy:
                    total_weight = Weight.very_heavy
                weight_2_msg = {
                    Weight.empty: 'so light as to be empty',
                    Weight.very_light: 'quite light',
                    Weight.light: 'light',
                    Weight.medium: 'medium',
                    Weight.heavy: 'somewhat heavy',
                    Weight.very_heavy: 'very heavy'
                }
                weight_msg = weight_2_msg[total_weight]

            if world_update_effects.spillage_level == SpillageLevel.none:
                msg = 'You lift up the box in place.'
                new_world = self.update(box=new_box)
            else:
                spill_msg = tt.uncapitalize(self.spill_message(new_box))
                msg = 'As you start to lift up the box, {}'.format(spill_msg)
                new_world = self.update(box=new_box, spilled_items=world_update_effects.spilled_items)
            
            if weight_msg:
                subject = 'It' if world_update_effects.spillage_level == SpillageLevel.none else 'The box'
                msg += '\n{} feels {}. You set it back down.'.format(subject, weight_msg)

            if world_update_effects.box_collapsed:
                msg += '\nThe added stress on the box causes it to collapse in on itself.'
                if world_update_effects.collapse_spilled_items:
                    msg += ' {}'.format(self.item_spill_message(world_update_effects.collapse_spilled_items))

            return new_world, msg

    def cut_or_tape_box(self, operation, face, direction, start_pos_a, start_pos_b, end_pos_b):
        with world_update() as world_update_effects:
            if face not in ['top', 'front']:
                raise CommandException('face must be either top or front. got {}'.format(face))

            f_code = 't' if face == 'top' else 's'

            if direction not in ['vertically', 'horizontally']:
                raise CommandException('{} direction must be vertically or horizontally. got {}'.format(operation, direction))

            dim_2_pos = {0: ['left', 'center', 'right'], 1: ['top', 'middle', 'bottom']}

            if direction == 'vertically':
                dim_a = 0
                dim_b = 1

            else:
                dim_a = 1
                dim_b = 0

            if start_pos_a not in dim_2_pos[dim_a]:
                raise CommandException('invalid start_pos_a for {} {}: {}'.format(direction, operation, start_pos_a))

            if start_pos_b not in dim_2_pos[dim_b]:
                raise CommandException('invalid start_pos_b for {} {}: {}'.format(direction, operation, start_pos_b))

            if end_pos_b not in dim_2_pos[dim_b]:
                raise CommandException('invalid end_pos_b for {} {}: {}'.format(direction, operation, end_pos_b))

            pt1 = [None, None]
            pt2 = [None, None]

            pt1[dim_a] = pt2[dim_a] = dim_2_pos[dim_a].index(start_pos_a)
            
            pt1[dim_b] = dim_2_pos[dim_b].index(start_pos_b)
            pt2[dim_b] = dim_2_pos[dim_b].index(end_pos_b)

            pt1 = tuple(pt1)
            pt2 = tuple(pt2)

            if abs(pt1[dim_b] - pt2[dim_b]) == 0:
                raise CommandException('no change between start_pos_b and end_pos_b.')

            if abs(pt1[dim_b] - pt2[dim_b]) == 2:
                #full cut, transform the box twice
                pt3 = [None, None]
                pt3[dim_a] = dim_2_pos[dim_a].index(start_pos_a)
                pt3[dim_b] = 1
                pt3 = tuple(pt3)

                cut_points = [(pt1, pt3), (pt3, pt2)]
            else:
                cut_points = [(pt1, pt2)]

            cut_edge_states = []

            new_box = self.box
            for p1, p2 in cut_points:
                vertices = new_box.box_mesh.faces[f_code].vertices
                v1 = vertices[p1]
                v2 = vertices[p2]
                if v2 < v1:
                    edge = (v2, v1)
                else:
                    edge = (v1, v2)

                cut_edge_states.append(new_box.edge_state[edge])
                new_box = new_box.cut_or_tape(operation, f_code, p1, p2)

            #fix overlaps for new/repaired dangles/rends
            for nd in world_update_effects.new_dangles[:]:
                if nd.partition in world_update_effects.new_rends:
                    world_update_effects.new_dangles.remove(nd)

            for rd in world_update_effects.repaired_dangles[:]:
                if rd.partition in world_update_effects.new_rends:
                    world_update_effects.repaired_dangles.remove(rd)

            if operation == 'cut':
                message = self.cut_message(new_box, cut_edge_states, world_update_effects)
            else:
                message = self.tape_message(new_box, cut_edge_states, world_update_effects)
            
            return self.update(box=new_box), message

    def cut_message(self, new_box, cut_edge_states, world_update_effects):
        if cut_edge_states[0].cardboard == CardboardEdge.intact:
            cut_message = 'You slide your blade along the cardboard{}.'.format(' and tape' if cut_edge_states[0].tape == TapeEdge.taped else '')
        else:
            if cut_edge_states[0].tape == TapeEdge.taped:
                cut_message = 'You draw your blade easily along the line. It slits open the thin layer of tape covering the gap in the cardboard.'
            else:
                cut_message = 'You slide your blade along the line, but nothing is there to resist it.'
        
        if len(cut_edge_states) > 1:
            if cut_edge_states[1].cardboard != cut_edge_states[0].cardboard:
                if cut_edge_states[1].cardboard == CardboardEdge.intact:
                    cut_message += ' Halfway across, it catches on solid cardboard, and you pull it along the rest of the way.'
                else:
                    if cut_edge_states[1].tape == TapeEdge.taped:
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade slides easily along the thin layer of tape.'
                    else:
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade is met with no further resistance.'

        new_rends_message = ''
        if world_update_effects.new_rends:
            total_face_membership = Counter()
            for r in world_update_effects.new_rends:
                face_membership = new_box.box_mesh.get_partition_face_membership(r)
                total_face_membership.update(face_membership)
            face_order = total_face_membership.most_common()
            face_order = [f for f, c in face_order if c > 0]
            face_msg = tt.face_message(face_order)
           
            if len(world_update_effects.new_rends) == 1:
                new_rends_message = 'A new section of cardboard comes free on the {}.'.format(face_msg)
            else:
                new_rends_message = '{} new sections of cardboard come free on the {}'.format(len(face_order), face_msg)
        
        new_dangles_message = ''
        if world_update_effects.new_dangles:
            total_face_membership = Counter()
            for d in world_update_effects.new_dangles:
                face_membership = new_box.box_mesh.get_partition_face_membership(d.partition)
                total_face_membership.update(face_membership)

            face_order = total_face_membership.most_common()
            face_order = [f for f, c in face_order if c > 0]
            face_msg = tt.face_message(face_order)

            if len(world_update_effects.new_dangles) == 1:
                new_dangles_message = 'A new section of cardboard on the {} can be swung freely on a hinge.'.format(face_msg)
            else:
                new_dangles_message = '{} new sections of cardboard on the {} can be swung freely on a hinge'.format(len(face_order), face_msg)

        message = cut_message
        if new_rends_message:
            message += '\n' + new_rends_message
        if new_dangles_message:
            message += '\n' + new_dangles_message

        return message

    def tape_message(self, new_box, cut_edge_states, world_update_effects):
        if any(ces.cardboard == CardboardEdge.intact for ces in cut_edge_states):
            cut_message = 'You draw out a length of tape and fasten it to the cardboard.'
        else:
            if any(ces.tape == TapeEdge.taped for ces in cut_edge_states):
                cut_message = 'You lay another length of tape over the cut edge.'
            else:
                cut_message = 'You seal the gap in the cardboard with a length of tape.'
        
        new_dangles_message = ''
        if world_update_effects.new_dangles:
            total_face_membership = Counter()
            for d in world_update_effects.new_dangles:
                face_membership = new_box.box_mesh.get_partition_face_membership(d.partition)
                total_face_membership.update(face_membership)

            face_order = total_face_membership.most_common()
            face_order = [f for f, c in face_order if c > 0]
            face_msg = tt.face_message(face_order)
           
        repaired_dangles_message = ''
        if world_update_effects.repaired_dangles:
            total_face_membership = Counter()
            for d in world_update_effects.repaired_dangles:
                face_membership = new_box.box_mesh.get_partition_face_membership(d.partition)
                total_face_membership.update(face_membership)
            face_order = total_face_membership.most_common()
            face_order = [f for f, c in face_order if c > 0]
            face_msg = tt.face_message(face_order)

            if len(world_update_effects.repaired_dangles) == 1:
                repaired_dangles_message = 'A formerly freely-swinging section of cardboard on the {} can no longer swing on its hinge.'.format(face_msg)
            else:
                repaired_dangles_message = '{} formerly freely-swinging sections of cardboard on the {} can no longer swing on their hinges.'.format(len(face_order), face_msg)

        message = cut_message
        if new_dangles_message:
            message += '\n' + new_dangles_message
        if repaired_dangles_message:
            message += '\n' + repaired_dangles_message

        return message

    def command_cut_box(self, face, direction, start_pos_a, start_pos_b, end_pos_b):
        return self.cut_or_tape_box('cut', face, direction, start_pos_a, start_pos_b, end_pos_b)

    def command_tape_box(self, face, direction, start_pos_a, start_pos_b, end_pos_b):
        return self.cut_or_tape_box('tape', face, direction, start_pos_a, start_pos_b, end_pos_b)

    def spill_message(self, new_box):
        global world_update_effects

        spilled_rends_msg = ''
        if world_update_effects.spilled_rends:
            total_face_membership = Counter()
            for sr in world_update_effects.spilled_rends:
                total_face_membership.update(new_box.box_mesh.get_partition_face_membership(sr))
            sr_faces = [f for f, c in total_face_membership.most_common() if c > 0]
            face_msg = tt.face_message(sr_faces)

            spilled_rends_msg = 'free cardboard on the {} falls away'.format(face_msg)

        spilled_dangles_msg = ''
        if world_update_effects.spilled_dangles:
            total_face_membership = Counter()
            for sd in world_update_effects.spilled_dangles:
                total_face_membership.update(new_box.box_mesh.get_partition_face_membership(sd.partition))
            sd_faces = [f for f, c in total_face_membership.most_common() if c > 0]
            face_msg = tt.face_message(sd_faces)

            spilled_dangles_msg = 'dangling cardboard on the {} swings open'.format(face_msg)

        structural_dmg_messages = [msg for msg in [spilled_dangles_msg, spilled_rends_msg] if msg]
        
        spill_msg = self.item_spill_message(world_update_effects.spilled_items)

        if structural_dmg_messages:
            structural_dmg_msg = ' and '.join(structural_dmg_messages)
            message = '{}. {}'.format(structural_dmg_msg, spill_msg)
        else:
            message = '{}'.format(spill_msg)

        return message

    def item_spill_message(self, spilled_items):
        si = spilled_items
        if len(si) == 1:
            item_msg = si[0].pre_gestalt()
            during_spill_msg = '{} spills out before you.'.format(item_msg).capitalize()
            after_spill_msg = "It's {} {} - {}.".format(si[0].article(), si[0].name(), si[0].post_gestalt())
        else:
            item_msg = ', '.join(i.pre_gestalt() for i in si[:-1]) + ' and ' + si[-1].pre_gestalt()
            during_spill_msg = '{} spill out before you.'.format(item_msg).capitalize()

            after_msgs = ['{} {} - {}'.format(i.article(), i.name(), i.post_gestalt()) for i in si]

            after_spill_msg = "It's {}".format(', '.join(after_msgs[:-1]) + ' and ' + after_msgs[-1] + '.')

        spill_msg = during_spill_msg + ' ' + after_spill_msg

        return spill_msg

    def command_open_dangle(self, face):
        return self.open_or_close_dangle('open', face)

    def command_close_dangle(self, face):
        return self.open_or_close_dangle('close', face)

    def open_or_close_dangle(self, operation, face):
        with world_update() as world_update_effects:
            face_2_f_code = {
                'top': 't',
                'back': 'n',
                'front': 's',
                'right': 'e',
                'left': 'w',
                'bottom': 'b'
            }
            applicable_dangles = [d for d in self.box.dangle_state if d.free_face == face_2_f_code[face]]
            new_box = self.box
            updated = []
            for d in applicable_dangles:
                try:
                    new_box = new_box.open_or_close_dangle(operation, d)
                except WorldUpdateException:
                    pass
                else:
                    updated.append(d)
            if not updated:
                raise WorldUpdateException('No dangles to {} on {} face'.format(operation, face))

            swing_dir_msg = 'in' if operation == 'close' else 'out'

            num_hinges = len(set(d.fixed_face for d in updated))
            if num_hinges == 1:
                hinge_msg = 'hinge'
            else:
                hinge_msg = 'hinges'

            message = 'You swing the cardboard on the {} of the box {} on its {}'.format(face, swing_dir_msg, hinge_msg)

            if not self.box.appears_open() and new_box.appears_open():
                message += '\nYou get a glimpse inside the box through the opening.'

                if new_box.appears_empty():
                    message += " It's empty."
                else:
                    message += ' You can see {} inside.'.format(new_box.next_item().pre_gestalt())

            if world_update_effects.box_collapsed:
                message += '\nThe added stress on the box causes it to collapse in on itself.'
                if world_update_effects.collapse_spilled_items:
                    message += ' {}'.format(self.item_spill_message(world_update_effects.collapse_spilled_items))

            return self.update(box=new_box), message

    def command_open_rend(self, face):
        return self.open_or_close_rend('open', face)

    def command_close_rend(self, face):
        return self.open_or_close_rend('close', face)

    def open_or_close_rend(self, operation, face):
        with world_update() as world_update_effects:
            face_2_f_code = {
                'top': 't',
                'back': 'n',
                'front': 's',
                'right': 'e',
                'left': 'w',
                'bottom': 'b'
            }
            f_code = face_2_f_code[face]
            applicable_rends = []
            for r in self.box.rend_state:
                face_membership = self.box.box_mesh.get_partition_face_membership(r)
                if face_membership[f_code] > 0:
                    applicable_rends.append(r)

            new_box = self.box
            updated = []
            for r in applicable_rends:
                try:
                    new_box = new_box.open_or_close_rend(operation, r)
                except WorldUpdateException:
                    pass
                else:
                    updated.append(r)
            
            if not updated:
                raise WorldUpdateException('No rends to {} on {} face'.format(operation, face))

            total_face_membership = Counter()
            for r in updated:
                total_face_membership.update(self.box.box_mesh.get_partition_face_membership(r))

            f_codes = [f for f, c in total_face_membership.most_common() if c > 0]
            face_msg = tt.face_message(f_codes)

            if operation == 'open':
                message = 'You remove the free cardboard from the {} and place it to the side.'.format(face_msg)
            else:
                message = 'You replace the missing cardboard from the {}.'.format(face_msg)

            if not self.box.appears_open() and new_box.appears_open():
                message += '\nYou get a glimpse inside the box through the opening.'

                if new_box.appears_empty():
                    message += " It's empty."
                else:
                    message += ' You can see {} inside.'.format(new_box.next_item().pre_gestalt())

            if world_update_effects.box_collapsed:
                message += '\nThe added stress on the box causes it to collapse in on itself.'
                if world_update_effects.collapse_spilled_items:
                    message += ' {}'.format(self.item_spill_message(world_update_effects.collapse_spilled_items))

            return self.update(box=new_box), message

    def command_take_item_box(self):
        with world_update() as world_update_effects:
            new_box = self.box.take_next_item()

            new_taken_items = self.taken_items[:]
            new_taken_items.extend(world_update_effects.taken_items)

            item = world_update_effects.taken_items[0]
            message = "You reach in and take {}. It's {}; {} {}.".format(
                item.pre_gestalt(), item.post_gestalt(), item.article(), item.name())

            if new_box.appears_empty():
                message += '\nThe box is empty now.'
            else:
                message += '\nYou can now see {} inside the box.'.format(new_box.next_item().pre_gestalt())

            return self.update(box=new_box, taken_items=new_taken_items), message


    def collapse_message(self):
        pass

class WorldDriver:
    def __init__(self, initial_world):
        self.world = initial_world

    def apply_command(self, cmd_name, *cmd_args):
        command_method = getattr(self.world, 'command_{}'.format(cmd_name))
        new_world, msg = command_method(*cmd_args)
        print('>', cmd_name, *cmd_args)
        print()
        print(msg)
        print()
        self.world = new_world

if __name__ == '__main__':
    contents = [Codex(), Pinecone(), CityKey()]
    world = SingleBoxWorld(box=Box(contents=contents))

    print('NEW WORLD: test heavy spillage when rolling\n\n\n')

    d = WorldDriver(world)

    d.apply_command('lift_box')
    d.apply_command('roll_box', 'forward')
    d.apply_command('rotate_y_box', 'left')

    # cut the top face vertically along the center from top to bottom
    d.apply_command('cut_box', 'top', 'vertically', 'center', 'top', 'bottom')

    # cut the top face vertically along the right edge from top to bottom
    d.apply_command('cut_box', 'top', 'vertically', 'right', 'top', 'bottom')

    #should result in a dangle
    # cut the top face horizontally along the top edge from center to right
    d.apply_command('cut_box', 'top', 'horizontally', 'top', 'center', 'right')

    #should result in a rend
    # cut the top face horizontally along the bottom edge from center to right
    d.apply_command('cut_box', 'top', 'horizontally', 'bottom', 'center', 'right')

    d.apply_command('roll_box', 'forward')

    #should result in the rend facing straight down, maybe spilling
    d.apply_command('roll_box', 'forward')

    d.apply_command('lift_box')

    print('\n\n\nNEW WORLD: test heavy spillage and collapse from bottom when lifting\n\n\n')
    d2 = WorldDriver(world)

    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right')
    d2.apply_command('rotate_y_box', 'left')
    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right')
    d2.apply_command('rotate_y_box', 'left')
    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right')
    d2.apply_command('rotate_y_box', 'left')
    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right')
    d2.apply_command('lift_box')
    
    print('\n\n\nNEW WORLD: test taping\n\n\n')
    d3 = WorldDriver(world)

    d3.apply_command('cut_box', 'top', 'horizontally', 'top', 'left', 'right')
    d3.apply_command('cut_box', 'top', 'horizontally', 'bottom', 'left', 'right')
    d3.apply_command('cut_box', 'top', 'vertically', 'left', 'top', 'bottom')

    d3.apply_command('open_dangle', 'top')
    d3.apply_command('take_item_box')

    d3.apply_command('close_dangle', 'top')

    d3.apply_command('cut_box', 'top', 'vertically', 'right', 'top', 'bottom')
    d3.apply_command('open_rend', 'top')
    d3.apply_command('take_item_box')    
    d3.apply_command('take_item_box')
    d3.apply_command('close_rend', 'top')

    d3.apply_command('tape_box', 'top', 'vertically', 'right', 'top', 'bottom')
    d3.apply_command('tape_box', 'top', 'vertically', 'left', 'top', 'middle')

    print('\n\n\nNEW WORLD: test light spillage when rolling and lifting\n\n\n')
    d4 = WorldDriver(world)

    d4.apply_command('cut_box', 'front', 'horizontally', 'top', 'left', 'right')
    d4.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right')
    d4.apply_command('cut_box', 'front', 'vertically', 'left', 'top', 'bottom')

    d4.apply_command('lift_box')

    d4.apply_command('cut_box', 'front', 'vertically', 'right', 'top', 'bottom')

    d4.apply_command('roll_box', 'right')


