/// <reference path='./headers/phaser.d.ts'/>

import 'phaser';
import { Boot } from './scenes/Boot';
import { Lobby } from './scenes/Lobby';
import { GameScene } from './scenes/GameScene';
import { GameManager } from './GameManager';
import { MainMenu } from './scenes/MainMenu';
import { GameEnd } from './scenes/GameEnd';
import { HelpPage } from './scenes/HelpPage';
import { Leaderboard } from './scenes/Leaderboard';
import { Disconnect } from './scenes/Disconnect';

// main game configuration
const config: GameConfig = {
  title: 'Guinea Dig: Lost in Ground - GGJ2021',
  width: GameManager.WINDOW_WIDTH,
  height: GameManager.WINDOW_HEIGHT,
  type: Phaser.WEBGL,
  parent: 'game',
  scene: [Boot, MainMenu, HelpPage, Lobby, GameScene, GameEnd, Leaderboard, Disconnect],
  input: {
    keyboard: true,
    mouse: true,
    touch: false,
    gamepad: false
  },
  backgroundColor: '#54321d',// a05e08
  render: { pixelArt: false, antialias: true, autoResize: false }
};

// game class
export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

// when the page is loaded, create our game instance
window.addEventListener('load', () => {
  var game = new Game(config);
});
