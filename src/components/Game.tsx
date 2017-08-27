import * as React from "react";
import * as ReactDom from "react-dom";

import {Terminal} from "./Terminal";

import {Item} from "../typescript/datatypes";
import * as Items from "../typescript/items";

import * as World from "../typescript/world";

import {WorldDriver, WorldType, MatchValidity} from "../typescript/commands";

import {BirdWorld} from '../typescript/bird_world';


export class Game extends React.Component<any, WorldDriver<World.SingleBoxWorld>> {
  world_driver: WorldDriver<WorldType>;

  componentWillMount () {
    // let contents: Item[] = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
    // let world = new World.SingleBoxWorld({box: new World.Box({contents: contents})});

    this.world_driver = new WorldDriver(new BirdWorld())
    
  }

  render () {
    return (
      <Terminal
        world_driver={this.world_driver}
      
       />
    );
  }
}
