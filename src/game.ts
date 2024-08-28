import { Match } from "./screens/match";
import { StartMenu } from "./screens/start-menu";

type GameState = 'not_started' | 'playing'

export class Game {
    constructor(private startMenu: StartMenu, private match: Match) {}

    private setState(state: GameState) {
        if (state === 'not_started') {
            this.startMenu.show()
            this.match.hide()
        } else if (state === 'playing') {
            this.startMenu.hide()
            this.match.show()
        } else {
            throw 'Unknown match state: ' + state
        }
    }

    init() {
        this.startMenu.onStartGameClick(() => {
            this.setState('playing')
        })

        this.match.onQuit(() => {
            this.setState('not_started')
        })
    }
}
