import { GameManager } from "../GameManager";

/**
 * Leaderboard/credits
 */
export class GameEnd extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: 'GameEnd'
        });
    }

    init() {
        this.enter = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );   
    }

    create() {
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 
            'Congratulations! Press enter to play again.');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.scene.start('MainMenu');
        }
    }
}