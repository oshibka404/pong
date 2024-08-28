interface Score {
    p1: number
    p2: number
}

export class ScoreBoard {
    private score1El: HTMLElement
    private score2El: HTMLElement
    el: HTMLElement

    private p1 = 0
    private p2 = 0

    private winCallback: (score: Score) => void = () => {
        throw 'onWin callback is not initialized'
    }

    onWin(winCallback: typeof this.winCallback) {
        this.winCallback = winCallback
    }
    
    constructor(private pointsToWin = 11) {
        this.el = document.createElement('header')
        this.score1El = document.createElement('div')
        this.score1El.innerText = '0'
        this.score2El = document.createElement('div')
        this.score2El.innerText = '0'
        this.el.append(this.score1El, this.score2El)
    }

    increment(player: 'p1' | 'p2') {
        this[player]++
        if (this[player] >= this.pointsToWin) {
            this.endGame()
        }
    }

    render() {
        this.score1El.innerText = this.p1.toString(10)
        this.score2El.innerText = this.p2.toString(10)
    }

    private endGame() {
        this.winCallback({
            p1: this.p1,
            p2: this.p2
        })
    }
}
