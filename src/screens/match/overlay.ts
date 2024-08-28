import { MatchStatus } from "./models"

export class MatchOverlay {
    private matchStateMessageEl: HTMLElement
    private quitMatchEl: HTMLElement

    private quit: () => void = () => {
        throw "Quit action is not defined"
    }

    el: HTMLElement

    constructor() {
        this.el = document.createElement('div')
        this.el.classList.add('match-state')

        this.matchStateMessageEl = document.createElement('div')

        this.quitMatchEl = document.createElement('button')
        this.quitMatchEl.innerText = 'Quit match'
        this.quitMatchEl.addEventListener("click", () => {
            this.quit()
        })

        this.el.append(this.matchStateMessageEl, this.quitMatchEl)
    }

    setQuitAction(callback: () => void) {
        this.quit = callback
    }

    show(status: MatchStatus) {
        switch (status) {
            case 'not_started':
                this.matchStateMessageEl.innerHTML = 'Press Space to Start'
                this.quitMatchEl.style.display = 'none'
                break;
            case 'paused':
                this.matchStateMessageEl.innerHTML = 'Press SPACE to continue'
                this.quitMatchEl.style.display = 'block'
                break;
            case 'finished':
                this.matchStateMessageEl.innerHTML = 'Game ended'
                this.quitMatchEl.style.display = 'block'
                break;
            default:
                throw 'Unknown match status: ' + status
        }
        this.el.style.display = 'flex'
    }

    hide() {
        this.matchStateMessageEl.innerHTML = ''
        this.el.style.display = 'none'
    }
}
