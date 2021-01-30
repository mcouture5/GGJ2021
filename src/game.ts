/// <reference path='./headers/phaser.d.ts'/>

import 'phaser';
import { Boot } from './scenes/Boot';
import { Lobby } from './scenes/Lobby';
import { GameScene } from './scenes/GameScene';
import { GameManager } from './GameManager';
import { MainMenu } from './scenes/MainMenu';

// main game configuration
const config: GameConfig = {
  title: 'Guinea Dig: Lost in Ground - GGJ2021',
  width: GameManager.WINDOW_WIDTH,
  height: GameManager.WINDOW_HEIGHT,
  type: Phaser.WEBGL,
  parent: 'game',
  scene: [Boot, MainMenu, Lobby, GameScene],
  input: {
    keyboard: true,
    mouse: false,
    touch: false,
    gamepad: false
  },
  backgroundColor: '#a05e08',
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
