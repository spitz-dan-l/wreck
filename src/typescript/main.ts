import {List} from 'immutable';
import {CityKey, Codex, Pinecone} from './items';
import {Item} from './datatypes';
import {Box, SingleBoxWorld, WorldDriver} from './world';

declare var jQuery: any;

jQuery(function($: any) {
    let contents = List<Item>([new Codex(), new Pinecone(), new CityKey()]);
    let world = new SingleBoxWorld({box: new Box({contents: contents})});
    let world_driver = new WorldDriver(world);

    $('#term').terminal(function(command: string) {
        if (command !== '') {
            try {
                var result = world_driver.run(command);
                if (result !== undefined) {
                    this.echo(new String(result));
                }
            } catch(e) {
                this.error(new String(e));
            }
        } else {
           this.echo('');
        }
    }, {
        greetings: 'Demo Parser Interface for The Wreck',
        name: 'wreck_demo',
        height: 500,
        prompt: '> '
    });
});