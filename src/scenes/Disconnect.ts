import { GameManager } from "../GameManager";

/**
 * Other player left
 */
export class Disconnect extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: 'Disconnect'
        });
    }

    init() {
        this.enter = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );   
    }

    create() {
        let bg = this.add.sprite(0, 0, 'bg_button').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;

        let mainMenuBtn = this.add.rectangle(109, 349, 207, 105, 0xffffff, 0);
        mainMenuBtn.setInteractive({useHandCursor: true});
        mainMenuBtn.on('pointerup', () => {
            this.scene.start('MainMenu');
        });

        let fontStyle = {
            fontFamily: 'InkFree',
            fontSize: '22px',
            color: '#f2dd6e'
        };

        this.add.text(GameManager.WINDOW_WIDTH/2 - 135, 200, 
            `The other player disconnected! :(`, fontStyle);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.scene.start('MainMenu');
        }
    }
}