import { GameManager } from "../GameManager";

/**
 * How to play
 */
export class HelpPage extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: 'HelpPage'
        });
    }

    init() {
        this.enter = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );   
    }

    create() {
        this.add.text(140, 200, 
            'Use the arrow keys to dig through the soil to find your mate in the fastest time.');
        this.add.text(GameManager.WINDOW_WIDTH/2 - 200, 600, 'Press [ENTER] to return to the main menu');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.scene.start('MainMenu');
        }
    }
}