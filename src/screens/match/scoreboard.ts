interface Score {
    p1: number
    p2: number
}

export class ScoreBoard {
    private score1El: HTMLElement
    private score2El: HTMLElement
    el: HTMLElement

    private model: Score = {
        p1: 0,
        p2: 0
    }

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

    reset() {
        this.model.p1 = 0
        this.model.p2 = 0
    }

    increment(player: 'p1' | 'p2') {
        this.model[player]++
        if (this.model[player] >= this.pointsToWin) {
            this.endGame()
        }
    }

    render() {
        this.score1El.innerText = this.model.p1.toString(10)
        this.score2El.innerText = this.model.p2.toString(10)
    }

    private endGame() {
        this.winCallback({
            p1: this.model.p1,
            p2: this.model.p2
        })
    }
}
