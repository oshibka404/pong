import './style.css'
import {Match} from './screens/match'
import { StartMenu } from './screens/start-menu'
import { Game } from './game'

const matchEl = document.getElementById('match')
if (!matchEl) {
  throw "Match element is not found"
}
const match = new Match(matchEl)

const startMenuEl = document.getElementById('start-menu')
if (!startMenuEl) {
  throw "Start menu element is not found"
}

const startMenu = new StartMenu(startMenuEl)

const game = new Game(startMenu, match)

game.init()
