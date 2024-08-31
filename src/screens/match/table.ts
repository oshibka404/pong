import { Point, Size } from "./models"

const CELL_SIZE = 16 // equal 1em
const BALL_RADIUS = 0.5
const PADDLE_SIZE = 8
const SPEED_CELLS_PER_MS = 20 / 1000

interface BallModel {
    position: Point
    speed: Point
}

interface PaddleModel {
    position: number
    speed: number
}

interface TableModel {
    ball: BallModel,
    paddle1: PaddleModel
    paddle2: PaddleModel
}

export class MatchTable {
    el: HTMLElement
    private paddle1El: HTMLElement
    private paddle2El: HTMLElement
    private ballEl: HTMLElement

    model: TableModel = {
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
    }

    private size: Size = {
        width: 0,
        height: 0
    }

    private scoreCallback: (player: 'p1' | 'p2') => void = () => {
        throw 'score callback is not initialized'
    }

    onScore(scoreCallback: typeof this.scoreCallback) {
        this.scoreCallback = scoreCallback
    }

    constructor() {
        this.el = document.createElement('main')
        this.el.classList.add('table')

        this.paddle1El = document.createElement('div')
        this.paddle1El.classList.add('paddle', 'paddle-p1')

        this.paddle2El = document.createElement('div')
        this.paddle2El.classList.add('paddle', 'paddle-p2')

        this.ballEl = document.createElement('div')
        this.ballEl.classList.add('ball')
        
        this.el.append(this.paddle1El, this.paddle2El, this.ballEl)
    }

    init(size: Size) {
        this.size = {
            width: Math.floor(size.width / CELL_SIZE) - 2,
            height: Math.floor(size.height / CELL_SIZE) - 8,
        }
        this.el.style.width = `${this.size.width}em`
        this.el.style.height = `${this.size.height}em`
    }

    reset() {
        this.model.ball = {
            position: {x: 0, y: 0},
            speed: {x: 0, y: 0}
        }
        setTimeout(() => {
            this.model.ball.speed.x = Math.random() > .5 ? -1 : 1
            this.model.ball.speed.y = Math.random()
        }, 1000)
    }

    updateModel(timeDelta: number) {
        const {ball, paddle1, paddle2} = this.model

        if (ball.position.y + BALL_RADIUS > this.size.height / 2) {
            ball.speed.y = -Math.abs(ball.speed.y)
        }
        
        if (ball.position.y - BALL_RADIUS < -this.size.height / 2) {
            ball.speed.y = Math.abs(ball.speed.y)
        }

        const leftScoreLine = -this.size.width / 2 + 2
        if (ball.position.x <= leftScoreLine + BALL_RADIUS) {
            const distanceFromPaddleCenter = ball.position.y - paddle1.position
            if (Math.abs(distanceFromPaddleCenter) <= PADDLE_SIZE / 2 + BALL_RADIUS) {
                ball.speed.x = Math.abs(ball.speed.x)
                ball.speed.y = distanceFromPaddleCenter / (PADDLE_SIZE / 2) // 0 to 1
            } else {
                this.scoreCallback('p2')
                this.reset()
            }
        }

        const rightScoreLine = -leftScoreLine
        if (ball.position.x > rightScoreLine - BALL_RADIUS) {
            const distanceFromPaddleCenter = ball.position.y - paddle2.position
            if (Math.abs(distanceFromPaddleCenter) <= (PADDLE_SIZE / 2) + BALL_RADIUS) {
                ball.speed.x = -Math.abs(ball.speed.x)
                ball.speed.y = distanceFromPaddleCenter / (PADDLE_SIZE / 2) // 0 to 1
            } else {
                this.scoreCallback('p1')
                this.reset()
            }
        }

        ball.position.x += ball.speed.x * timeDelta * SPEED_CELLS_PER_MS
        ball.position.y += ball.speed.y * timeDelta * SPEED_CELLS_PER_MS
        
        paddle1.position += paddle1.speed * timeDelta * SPEED_CELLS_PER_MS
        paddle1.position = Math.max(paddle1.position, -this.size.height / 2 + PADDLE_SIZE / 2)
        paddle1.position = Math.min(paddle1.position, this.size.height / 2 - PADDLE_SIZE / 2)

        paddle2.position += paddle2.speed * timeDelta * SPEED_CELLS_PER_MS
        paddle2.position = Math.max(paddle2.position, -this.size.height / 2 + PADDLE_SIZE / 2)
        paddle2.position = Math.min(paddle2.position, this.size.height / 2 - PADDLE_SIZE / 2)
    }

    render() {
        this.paddle1El.style.top = `${this.model.paddle1.position + this.size.height / 2 - PADDLE_SIZE / 2}em`
        this.paddle2El.style.top = `${this.model.paddle2.position + this.size.height / 2 - PADDLE_SIZE / 2}em`
        this.ballEl.style.top = `${this.model.ball.position.y + this.size.height / 2 - BALL_RADIUS}em`
        this.ballEl.style.left = `${this.model.ball.position.x + this.size.width / 2 - BALL_RADIUS}em`
    }

    onKeyDown(code: string) {
        switch(code) {
            case 'ArrowUp':
                this.model.paddle2.speed = -1
                break;
            case 'ArrowDown':
                this.model.paddle2.speed = 1
                break;
            case 'KeyS':
                this.model.paddle1.speed = -1
                break;
            case 'KeyX':
                this.model.paddle1.speed = 1
                break;
        }
        
    }

    onKeyUp(code: string) {
        switch(code) {
            case 'ArrowUp':
            case 'ArrowDown':
                this.model.paddle2.speed = 0
                break;
            case 'KeyS':
            case 'KeyX':
                this.model.paddle1.speed = 0
                break;
        }
    }
}
