import { GameManager } from "../GameManager";


export class Leaderboard extends Phaser.Scene {


    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    constructor() {
        super({
            key: 'Leaderboard'
        });
    }

    init() {
        this.enter = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );   
    }

    create() {
        let bg = this.add.sprite(0, 0, 'leaderboard').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;

        this.add.text(GameManager.WINDOW_WIDTH/2 - 200, 500, 'Press [ENTER] to return to the main menu');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.scene.start('MainMenu');
        }
    }
}