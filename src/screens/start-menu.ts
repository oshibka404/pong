import './start-menu.css'

export class StartMenu {
    constructor(
        private startMenuEl: HTMLElement,
    ) {
        startMenuEl.innerHTML = `
            <header>PONG</header>
            <button id="start">Start</button>
        `
        const startButton = document.getElementById('start')
        if (!startButton) {
          throw "Start button element is not found"
        }
        startButton.addEventListener("click", () => {
            this.startGame()
        })
    }

    private startGame: () => void = () => {throw "Start 1P is not initialized"}

    
    onStartGameClick(callback: () => void): void {
        this.startGame = callback
    }

    show() {
        this.startMenuEl.style.display = 'flex'
    }

    hide() {
        this.startMenuEl.style.display = 'none'
    }
}
