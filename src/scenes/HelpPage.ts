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
        let bg = this.add.sprite(0, 0, 'how_to_play').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;

        let mainMenuBtn = this.add.rectangle(109, 349, 207, 105, 0xffffff, 0);
        mainMenuBtn.setInteractive({useHandCursor: true});
        mainMenuBtn.on('pointerup', () => {
            this.scene.start('MainMenu');
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.scene.start('MainMenu');
        }
    }
}