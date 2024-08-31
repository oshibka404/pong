import './index.css'
import { MatchStatus } from './models'
import { MatchOverlay } from './overlay'
import { ScoreBoard } from './scoreboard'
import { MatchTable } from './table'

interface MatchModel {
    status: MatchStatus
    gameplayTime: number
    pausedTime: number
}

const defaultModelState = {
    status: 'not_started',
    gameplayTime: 0,
    pausedTime: 0,
} satisfies MatchModel

export class Match {
    private model: MatchModel = defaultModelState

    // private debugEl: HTMLElement

    private quit: () => void = () => {
        throw "Quit match callback is not initialized"
    }

    private _handleKeyDown: ((e: KeyboardEvent) => void) | null = null
    private _handleKeyUp: ((e: KeyboardEvent) => void) | null = null
    private matchOverlay: MatchOverlay
    private scoreboard: ScoreBoard
    private table: MatchTable

    constructor(private matchEl: HTMLElement) {
        this.scoreboard = new ScoreBoard()
        matchEl.appendChild(this.scoreboard.el)
        this.scoreboard.onWin(() => {
            this.setStatus('finished')
        })

        this.table = new MatchTable()
        matchEl.appendChild(this.table.el)
        this.table.onScore((player) => {
            this.scoreboard.increment(player)
        })

        this.matchOverlay = new MatchOverlay()
        matchEl.appendChild(this.matchOverlay.el)

        // this.debugEl = document.createElement('div')
        // this.debugEl.id = 'debug'
        // matchEl.appendChild(this.debugEl)

        this.nextFrame = this.nextFrame.bind(this)
    }

    private nextFrame(elapsedTime: number) {
        if (!this.model.gameplayTime) {
            this.model.gameplayTime = elapsedTime
        }
        if (this.model.status === 'paused') {
            this.model.pausedTime = elapsedTime - this.model.gameplayTime
        }

        this.updateModel(elapsedTime - this.model.pausedTime)
        
        // this.debugEl.innerHTML = `<pre>${JSON.stringify(this.model, undefined, '  ')}</pre>`

        this.render()

        requestAnimationFrame(this.nextFrame)
    }

    private render() {
        this.table.render()
        this.scoreboard.render()
    }

    private updateModel(gameplayTime: number): void {
        const timeDelta = gameplayTime - this.model.gameplayTime
        this.model.gameplayTime = gameplayTime
        this.table.updateModel(timeDelta)
    }

    private setStatus(status: MatchStatus) {
        this.model.status = status
        if (status === 'running') {
            this.matchOverlay.hide()
        } else {
            this.matchOverlay.show(status)
        }
        requestAnimationFrame(this.nextFrame)
    }

    onQuit(callback: () => void): void {
        this.matchOverlay.setQuitAction(callback)
    }

    show() {
        this.matchEl.style.display = 'flex'
        this.table.init({
            width: this.matchEl.clientWidth,
            height: this.matchEl.clientHeight
        })
        this.initKeyboard()
        this.setStatus('not_started')
        this.table.reset()
    }

    private initKeyboard() {
        this._handleKeyDown = this.handleKeyDown.bind(this)
        document.body.addEventListener("keydown", this._handleKeyDown)

        this._handleKeyUp = this.handleKeyUp.bind(this)
        document.body.addEventListener("keyup", this._handleKeyUp)
    }

    private startGame() {
        this.setStatus('running')
    }

    private handleKeyDown(e: KeyboardEvent) {
        switch (e.code) {
            case 'Space':
                if (this.model.status === 'running') {
                    this.setStatus('paused')
                } else if (this.model.status === 'not_started') {
                    this.startGame()
                } else if (this.model.status === 'paused') {
                    this.setStatus('running')
                }
                break;
            case 'Escape':
                if (this.model.status === 'running') {
                    this.setStatus('paused')
                } else if (this.model.status === 'not_started') {
                    this.quit()
                } else if (this.model.status === 'paused') {
                    this.setStatus('running')
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'KeyS':
            case 'KeyX':
                if (this.model.status === 'running') {
                    this.table.onKeyDown(e.code)
                }
                break;
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        switch (e.code) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'KeyS':
            case 'KeyX':
                if (this.model.status === 'running') {
                    this.table.onKeyUp(e.code)
                }
                break;
        }
    }

    hide() {
        this.matchEl.style.display = 'none'
        this.setStatus('not_started')
        this.model = defaultModelState
        if (this._handleKeyDown) {
            document.body.removeEventListener("keydown", this._handleKeyDown)
        }
        if (this._handleKeyUp) {
            document.body.removeEventListener("keyup", this._handleKeyUp)
        }
    }
}
