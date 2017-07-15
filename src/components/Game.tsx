import * as React from "react";
import * as ReactDom from "react-dom";

import {Terminal} from "react-if-terminal";

import {Item} from "../typescript/datatypes";
import * as Items from "../typescript/items";

import * as World from "../typescript/world";

import {WorldDriver, MatchValidity} from "../typescript/commands";


export default class Game extends React.Component<any, any> {
    world_driver: WorldDriver<World.SingleBoxWorld>;

    componentWillMount () {
        let contents: Item[] = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
        let world = new World.SingleBoxWorld({box: new World.Box({contents: contents})});

        this.world_driver = new WorldDriver(world);
    }

    handleCommandSubmit = (input: string) => {
        console.log(input);
        let result = this.world_driver.commit();
        return result.message;
    }

    handlePromptChange = (input) => {
        console.log(input);
        let result = this.world_driver.apply_command(input, false);
        let isValid = result.parser.validity === MatchValidity.valid;
        let autocomplete = result.parser.match[result.parser.match.length - 1].typeahead;
        return {isValid, autocomplete};
    }

    renderHeader = () => {
        return (
            <div style={{height: 20, color: 'white'}}>
                {this.world_driver.history.length}
            </div>
        )
    }

    render () {
        return (
            <div style={{height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Terminal 
                    width="100%"
                    height="100%"
                    header={this.renderHeader}
                    onCommandSubmit={this.handleCommandSubmit}
                    onPromptChange={this.handlePromptChange} 
                 />
            </div>
        );
    }
}