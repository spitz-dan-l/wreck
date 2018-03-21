import * as React from 'react';

export class Preface extends React.Component<any, any> {
  div: HTMLDivElement;

  start_game = () => {
    this.div.style.display = 'none';
    this.props.on_start_game();
  }

  render() {
    return (
      <div className="preface" ref={(d) => this.div = d}>
        <h1 onClick={this.start_game}>
            <a href='#'>Start Venience World</a>
        </h1>
        <h3>
        Welcome to Venience World!
        </h3>

        <section>
        <h3>How to play</h3>
        Venience World uses a new parser interface with command highlighting, animated text and autocomplete.
        <br/><br/>
        Use tab, enter, the arrow keys or the mouse to select autocompletions of your commands as you play.
        <br/><br/>
        I hope you enjoy playing!
        <br/><br/>
        <strong>Warning:</strong> Currently there is <i>no way to save or load</i> your game. If you need to take a break, leave Venience World open in a tab. Save/Load will certainly be added in a future release.
        </section>
        
        <section>
        <h3>Replaying</h3>
        Venience World is designed to make all content accessible in a single playthrough.
        <br/><br/>
        This means you will <i>never be expected</i> to reset the game and repeat yourself in order to explore a missed branch.
        <br/><br/>
        Have faith in this as you play through the game. Replaying a game is often worthwhile; in this case, just know it is not <i>required</i> to get the full experience.
        </section>

        <section>
        <h3>Browser compatibility</h3>
        Venience World has been tested to work on the Chrome and Firefox browsers.
        <br/><br/>
        It definitely doesn't work on Safari.
        <br/><br/>
        I haven't tested it on IE/Edge, Opera, or others.
        </section>

        <section>
        <h3>Development progress</h3>
        This is a playable demo with a prologue and partial first chapter.
        <br/><br/>
        Most of what you see will be subject to change for the final release.
        <br/><br/>
        I'm not sure when the final release will be.
        </section>

        <section>
        <h3>Contact</h3>
        If you are interested in updates on the game, follow the <a href="https://twitter.com/VenienceWorld">@VenienceWorld</a> twitter account, or <a href="mailto:spitz.dan.L+venience@gmail.com">email me</a>.
        <br/><br/>
        I would love to hear about your experience playing Venience World!
        </section>

        <section>
        <h3>Open source</h3>
        Venience World is open source.
        <br/><br/>
        The project can be found at <a href="https://github.com/spitz-dan-l/wreck/">https://github.com/spitz-dan-l/wreck/</a>.
        <br/><br/>
        It is written in Typescript.
        <br/><br/>
        If you are interested in learning how it works, or using or extending the interface, please reach out!
        <br/><br/>
        If there is sufficient interest I may spend some time on refactoring the code into a proper engine.
        </section>

        <section>
        <h3>The name</h3>
        The name "Venience World" is a play on "<a href="https://plato.stanford.edu/entries/supervenience/">Supervenience</a>", and the trope for games to have names of the form "Super <i>X</i> World".
        <br/><br/>
        The game is thematically about seeking an understanding about what is going on. Supervenience as a concept is one of the philosophical tools that has been developed for doing that.
        </section>
      </div>  
    );
  }
}