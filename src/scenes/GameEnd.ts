import { GameManager } from "../GameManager";

/**
 * Leaderboard/credits
 */
export class GameEnd extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    private timeElapsed: number;

    constructor() {
        super({
            key: 'GameEnd'
        });
    }

    init(data: {elapsed_time: number}) {

        this.timeElapsed = data.elapsed_time;

        this.enter = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );   
    }

    create() {
        let time = new String(this.timeElapsed).slice(0,5);
        this.add.text(GameManager.WINDOW_WIDTH/2 - 220, 200, 
            `Congratulations! You finished in ${time} seconds.`);

        this.add.text(GameManager.WINDOW_WIDTH/2 - 150, 600, 
            'Press [ENTER] to play again.');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.scene.start('MainMenu');
        }
    }
}