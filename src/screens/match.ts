import './match.css'

type MatchStatus = 'not_started' | 'running' | 'paused' | 'finished'

interface Point {
    x: number,
    y: number
}

interface BallModel {
    position: Point
    speed: Point
}

interface PaddleModel {
    position: number,
    speed: number
}

interface MatchState {
    status: MatchStatus
    timestamp: number
    score: {
        p1: number
        p2: number
    },
    table: {
        ball: BallModel,
        paddle1: PaddleModel
        paddle2: PaddleModel
    }
}

const CELL_SIZE = 16; // equal 1em;
const BALL_RADIUS = 0.5;
const PADDLE_SIZE = 8;
const SPEED_CELLS_PER_MS = 20 / 1000;

const defaultState = {
    status: 'not_started' as MatchStatus,
    timestamp: 0,
    table: {
        ball: {
            position: {x: 0, y: 0},
            speed: {x: 0, y: 0}
        },
        paddle1: {
            position: 0,
            speed: 0
        },
        paddle2: {
            position: 0,
            speed: 0
        }
    },
    score: {
        p1: 0,
        p2: 0,
    }
}

export class Match {

    private tableSize = {
        width: 0,
        height: 0
    }

    private state: MatchState = defaultState

    private matchStateEl: HTMLElement
    private matchStateMessageEl: HTMLElement

    private tableEl: HTMLElement
    private paddle1El: HTMLElement
    private paddle2El: HTMLElement
    private ballEl: HTMLElement
    private quitMatchEl: HTMLElement
    private score1El: HTMLElement
    private score2El: HTMLElement
    private debugEl: HTMLElement

    private quit: () => void = () => {
        throw "Quit match callback is not initialized"
    }

    private _handleKeyDown: ((e: KeyboardEvent) => void) | null = null
    private _handleKeyUp: ((e: KeyboardEvent) => void) | null = null

    constructor(private matchEl: HTMLElement) {
        matchEl.innerHTML = `
            <header>
                <div id="p1" class="score"></div>
                <div id="p2" class="score"></div>
            </header>
            <main id="table">
                <div id="paddle-p1" class="paddle"></div>
                <div id="paddle-p2" class="paddle"></div>
                <div id="ball"></div>
            </main>
            <div id="match-state">
                <div id="match-state-message"></div>
                <button id="quit-match">Quit match</div>
            </div>
            <div id="debug"></div>
        `;

        this.matchStateEl = document.getElementById('match-state')!
        this.matchStateMessageEl = document.getElementById('match-state-message')!
        this.quitMatchEl = document.getElementById('quit-match')!
        this.tableEl = document.getElementById('table')!
        this.paddle1El = document.getElementById('paddle-p1')!
        this.paddle2El = document.getElementById('paddle-p2')!
        this.ballEl = document.getElementById('ball')!

        this.score1El = document.getElementById('p1')!
        this.score2El = document.getElementById('p2')!

        this.quitMatchEl.addEventListener("click", () => {
            this.quit()
        })

        this.debugEl = document.getElementById('debug')!
        this.tick = this.tick.bind(this)
    }

    tick(timestamp: number) {
        if (!this.state.timestamp) {
            this.state.timestamp = timestamp
        }
        if (this.state.status !== 'running') {
            this.state.timestamp
            return
        }

        const state = this.updateState(this.state, timestamp)

        this.renderTable(state)

        requestAnimationFrame(this.tick)
    }

    private renderTable(state: MatchState) {
        this.paddle1El.style.top = `${state.table.paddle1.position + this.tableSize.height / 2 - PADDLE_SIZE / 2}em`
        this.paddle2El.style.top = `${state.table.paddle2.position + this.tableSize.height / 2 - PADDLE_SIZE / 2}em`
        this.ballEl.style.top = `${state.table.ball.position.y + this.tableSize.height / 2 - BALL_RADIUS}em`
        this.ballEl.style.left = `${state.table.ball.position.x + this.tableSize.width / 2 - BALL_RADIUS}em`

        this.score1El.innerText = state.score.p1.toString(10)
        this.score2El.innerText = state.score.p2.toString(10)
    }

    private updateState(state: MatchState, timestamp: number): MatchState {
        const timeDelta = timestamp - this.state.timestamp
        this.state.timestamp = timestamp

        const {ball, paddle1, paddle2} = state.table

        if (Math.abs(ball.position.y) > this.tableSize.height / 2) {
            ball.speed.y = -ball.speed.y
        }

        const leftScoreLine = -this.tableSize.width / 2 + 2
        const rightScoreLine = this.tableSize.width / 2 - 2

        if (ball.position.x < leftScoreLine + BALL_RADIUS) {
            const distanceFromPaddleCenter = paddle1.position - ball.position.y
            if (Math.abs(distanceFromPaddleCenter) < PADDLE_SIZE / 2) {
                this.bounceFromPaddle(ball, distanceFromPaddleCenter)
            } else {
                this.state.score.p2 += 1
                this.resetBall()
            }
        }

        if (ball.position.x > rightScoreLine - BALL_RADIUS) {
            const distanceFromPaddleCenter = paddle2.position - ball.position.y
            if (Math.abs(distanceFromPaddleCenter) < PADDLE_SIZE / 2) {
                this.state.table.ball = this.bounceFromPaddle(ball, distanceFromPaddleCenter)
            } else {
                this.state.score.p1 += 1
                this.resetBall()
            }
        }

        ball.position.x += ball.speed.x * timeDelta * SPEED_CELLS_PER_MS
        ball.position.x = Math.max(ball.position.x, leftScoreLine)
        ball.position.x = Math.min(ball.position.x, rightScoreLine)
        
        ball.position.y += ball.speed.y * timeDelta * SPEED_CELLS_PER_MS
        
        paddle1.position += paddle1.speed * timeDelta * SPEED_CELLS_PER_MS
        paddle1.position = Math.max(paddle1.position, -this.tableSize.height / 2 + PADDLE_SIZE / 2)
        paddle1.position = Math.min(paddle1.position, this.tableSize.height / 2 - PADDLE_SIZE / 2)

        paddle2.position += paddle2.speed * timeDelta * SPEED_CELLS_PER_MS
        paddle2.position = Math.max(paddle2.position, -this.tableSize.height / 2 + PADDLE_SIZE / 2)
        paddle2.position = Math.min(paddle2.position, this.tableSize.height / 2 - PADDLE_SIZE / 2)

        this.debugEl.innerHTML = `<pre>${JSON.stringify(this.state, undefined, '  ')}</pre>`

        return this.state
    }

    private bounceFromPaddle(ball: BallModel, distanceFromPaddleCenter: number): BallModel {
        ball.speed.x = -ball.speed.x
        ball.speed.y = -distanceFromPaddleCenter / (PADDLE_SIZE / 2) // 0 to 1
        return ball
    }

    private resetBall() {
        this.state.table.ball = {
            position: {x: 0, y: 0},
            speed: {x: 0, y: 0}
        }
        setTimeout(() => {
            this.state.table.ball.speed.x = Math.random() > .5 ? -1 : 1
            this.state.table.ball.speed.y = Math.random()
        }, 1000)
    }

    private setStatus(state: MatchStatus) {
        this.state.status = state
        if (state === 'not_started') {
            this.matchStateMessageEl.innerHTML = 'Press Space to Start'
            this.matchStateEl.style.display = 'flex'
        } else if (state === 'running') {
            this.matchStateMessageEl.innerHTML = ''
            this.matchStateEl.style.display = 'none'
            requestAnimationFrame(this.tick)
        } else if (state === 'paused') {
            this.matchStateMessageEl.innerHTML = 'Press SPACE to continue'
            this.matchStateEl.style.display = 'flex'
            this.quitMatchEl.style.display = 'block'
            this.state.timestamp = 0
        } else if (state === 'finished') {
            this.matchStateMessageEl.innerHTML = 'Game ended'
            this.matchStateEl.style.display = 'flex'
            this.quitMatchEl.style.display = 'block'
        } else {
            throw 'Unknown match state: ' + state
        }
    }

    onQuit(callback: () => void): void {
        this.quit = callback
    }

    show() {
        this.matchEl.style.display = 'flex'
        this.initTable()
        this.initKeyboard()
        this.setStatus('not_started')
    }

    private initKeyboard() {
        this._handleKeyDown = this.handleKeyDown.bind(this)
        document.body.addEventListener("keydown", this._handleKeyDown)

        this._handleKeyUp = this.handleKeyUp.bind(this)
        document.body.addEventListener("keyup", this._handleKeyUp)
    }

    private startGame() {
        this.resetBall()
        this.setStatus('running')
    }

    private initTable() {
        this.tableSize = {
            width: Math.floor(this.matchEl.clientWidth / CELL_SIZE) - 2,
            height: Math.floor(this.matchEl.clientHeight / CELL_SIZE) - 8,
        }
        this.tableEl.style.width = `${this.tableSize.width}em`
        this.tableEl.style.height = `${this.tableSize.height}em`
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === ' ') {
            if (this.state.status === 'running') {
                this.setStatus('paused')
            } else if (this.state.status === 'not_started') {
                this.startGame()
            } else if (this.state.status === 'paused') {
                this.setStatus('running')
            }
        }

        if (e.key === 'Escape') {
            if (this.state.status === 'running') {
                this.setStatus('paused')
            } else if (this.state.status === 'not_started') {
                this.quit()
            } else if (this.state.status === 'paused') {
                this.setStatus('running')
            }
        }

        if (e.key === 'ArrowUp') {
            if (this.state.status === 'running') {
                this.state.table.paddle2.speed = -1
            }
        }
        if (e.key === 'ArrowDown') {
            if (this.state.status === 'running') {
                this.state.table.paddle2.speed = 1
            }
        }

        if (e.key.toLowerCase() === 's') {
            if (this.state.status === 'running') {
                this.state.table.paddle1.speed = -1
            }
        }
        if (e.key.toLowerCase() === 'x') {
            if (this.state.status === 'running') {
                this.state.table.paddle1.speed = 1
            }
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (this.state.status === 'running') {
                this.state.table.paddle2.speed = 0
            }
        }

        if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'x') {
            if (this.state.status === 'running') {
                this.state.table.paddle1.speed = 0
            }
        }
    }

    private resetState() {
        this.setStatus('not_started')
        this.state = defaultState
    }

    hide() {
        this.matchEl.style.display = 'none'
        this.resetState()
        if (this._handleKeyDown) {
            document.body.removeEventListener("keydown", this._handleKeyDown)
        }
        if (this._handleKeyUp) {
            document.body.removeEventListener("keyup", this._handleKeyUp)
        }
    }
}
