import * as React from "react";
import * as ReactDom from "react-dom";

import {Game} from "../components/Game";

ReactDom.render(<Game />, document.getElementById('game'));

// import {List, Map} from 'immutable';
// import {CityKey, Codex, Pinecone} from './items';
// import {Item} from './datatypes';
// import {Box, SingleBoxWorld} from './world';
// import {MatchValidity, DisplayElt, DisplayEltType, WorldDriver, CommandParser, CommandResult} from './commands';
// import {last, tokenize} from './text_tools';


// declare var jQuery: any;

// // previous command handler func (first arg to .terminal() )
// // function(command: string) {
// //         if (command !== '') {
// //             try {
// //                 //hold on to parser object
// //                 //highlight matched bits of command
// //                 //offer autocomplete solutions
// //                 let result = world_driver.run(command);
// //                 if (result !== undefined) {
// //                     this.echo(new String(result));
// //                 }
// //             } catch(e) {
// //                 this.error(new String(e));
// //             }
// //         } else {
// //            this.echo('');
// //         }
// //     }

// export let elt_color = Map<DisplayEltType, string>().asMutable();
// elt_color.set(DisplayEltType.keyword, 'white');
// elt_color.set(DisplayEltType.option, 'blue');
// elt_color.set(DisplayEltType.filler, 'gray');
// elt_color.set(DisplayEltType.partial, 'gray');
// elt_color.set(DisplayEltType.error, 'red');

// setTimeout(function () {
//     jQuery(function($: any) {
//         let contents = List<Item>([new Codex(), new Pinecone(), new CityKey()]);
//         let world = new SingleBoxWorld({box: new Box({contents: contents})});
//         let world_driver = new WorldDriver(world);
//         let current_result = world_driver.current_state;
//         var ul: any;
//         function format_command(command: string) {
//             // TODO: don't apply to non-command strings
//             if ($.terminal.have_formatting(command)){
//                 return command;
//             }
//             command = command.replace(/(\s|&nbsp;)/g, ' ');
//             let result = world_driver.run(command, false);
//             let pos = 0;
//             let parser = result.parser;
//             let valid_fmt = '';
//             if (parser.validity === MatchValidity.valid){
//                 valid_fmt = 'b';
//             }

//             let formatted = '';
//             for (let elt of parser.match) {
//                 if (elt.match.length > 0){
//                     formatted += `[[${valid_fmt};${elt_color.get(elt.display)};]${elt.match}]`;
//                     pos += elt.match.length;
//                 }
//                 while (true){
//                     //eat the spaces
//                     let c = command.charAt(pos);
//                     if (c.match(' ') !== null){
//                         formatted += c;
//                         pos += 1;
//                     } else {
//                         break;
//                     }
//                 }
//             }
//             return formatted;
//         }
//         // $.terminal.defaults.formatters.push(format_command)

//         function format_command_with_prompt(command:string){
//             let naked_command = command.slice(2);
//             return '> ' + format_command(naked_command);
//         }

//         function update_typeahead(terminal: any) {
//             // TODO: distinguish enabled & disabled typeahead
//             let command = terminal.get_command();
//             ul.empty();
//             let result = world_driver.run(command, false);
//             let parser = result.parser;

//             if (parser.validity === MatchValidity.partial){
//                 let m = last(parser.match);
//                 ul.hide();
//                 let com_end = last(command);

//                 if (m.match.length === 0 && com_end !== undefined && com_end.match(/(\s|&nbsp;)/) === null){
//                     return;
//                 }
//                 for (let t of m.typeahead){
//                     $('<li>' + t + '</li>').appendTo(ul);
//                 }
//                 ul.show();
//             }
//         }

//         function exec_command(command: string, terminal: any) {
//             let result = world_driver.run(command, true);
//             let parser = result.parser;
            
//             $.terminal.defaults.formatters.pop()
//             $.terminal.defaults.formatters.push(format_command_with_prompt);
//             terminal.echo('> ' + command);
//             $.terminal.defaults.formatters.pop();

//             if (result.message !== undefined){
//                 terminal.echo(result.message);
//                 terminal.echo(' ');
//             }
//             $.terminal.defaults.formatters.push(format_command);
//         }

//         function handle_keydown(e: any, terminal: any) {
//             setTimeout(function () {
//                 let command = terminal.get_command();
                
//             })
//         }

//         $('#term').terminal(exec_command, {
//             greetings: '[[;white;]Demo Parser Interface for The Wreck]',
//             name: 'wreck_demo',
//             height: 500,
//             //prompt: '> ',
//             onInit: function(term: any) {
//                 var wrapper = term.cmd().find('.cursor').wrap('<span/>').parent()
//                     .addClass('cmd-wrapper');
//                 ul = $('<ul></ul>').appendTo(wrapper);
//                 ul.on('click', 'li', function() {
//                     let txt = $(this).text();
//                     let cur_word = term.before_cursor(true);
//                     term.insert(txt.replace(cur_word, '') + ' ');
//                     ul.empty();
//                     setTimeout(function () {update_typeahead(term);}, 0);
//                 });
//                 setTimeout(function () {update_typeahead(term);}, 0);
//             },
//             keydown: function(e: any, terminal: any) {
//                 // setTimeout because terminal is adding characters in keypress
//                 // we use keydown because we need to prevent default action for
//                 // tab and still execute custom code
//                 setTimeout(function() {
//                     update_typeahead(terminal);
//                 }, 0);
//             },
//             onBlur: function() {
//                 return false;
//             },
//             memory: true,
//             echoCommand: false,
//             wordAutocomplete: true
//         });
//     });
// }, 0);