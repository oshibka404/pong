import './start-menu.css'

export class StartMenu {
    constructor(
        private startMenuEl: HTMLElement,
    ) {
        startMenuEl.innerHTML = `
            <header>PONG</header>
            <button id="start">Start</button>
            <div class="controls">
                <div>P1 <span class="key">S</span>↑ <span class="key">X</span>↓</div>
                <div>P2 <span class="key">↑</span>↑ <span class="key">↓</span>↓</div>
                <div><span class="key">Space</span>: Pause</div>
            </div>
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
