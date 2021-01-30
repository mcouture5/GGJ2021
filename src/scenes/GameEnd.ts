import { GameManager } from "../GameManager";

/**
 * Leaderboard/credits
 */
export class GameEnd extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    private timeElapsed: number;

    private gameSceneMusic: Phaser.Sound.BaseSound;
    private reunionSound: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'GameEnd'
        });
    }

    init(data: {elapsed_time: number, gameSceneMusic: Phaser.Sound.BaseSound}) {

        this.timeElapsed = data.elapsed_time;
        this.gameSceneMusic = data.gameSceneMusic;

        this.enter = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );
    }

    create() {
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 
            `Congratulations! You finished in ${this.timeElapsed} seconds.`);

        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2, 
            'Press enter to play again.');

        // play reunion sound if not already played
        if (!this.reunionSound || !this.reunionSound.isPlaying) {
            this.reunionSound = this.sound.add('reunion', {volume: 1});
            this.reunionSound.play();
        }
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            // stop GameScene music and transition to MainMenu scene
            this.gameSceneMusic.stop();
            this.scene.start('MainMenu');
        }
    }
}