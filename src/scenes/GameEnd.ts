import { GameManager } from "../GameManager";

/**
 * Leaderboard/credits
 */
export class GameEnd extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    private timeElapsed: number;

    private fading: boolean;

    private gameSceneMusic: Phaser.Sound.BaseSound;
    private endMusic: Phaser.Sound.BaseSound;
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
        // Todo: change this artwork once the leaderboard is added
        let bg = this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;

        let time = new String(this.timeElapsed).slice(0,5);
        this.add.text(GameManager.WINDOW_WIDTH/2 - 220, 200, 
            `Congratulations! You finished in ${time} seconds.`);

        this.add.text(GameManager.WINDOW_WIDTH/2 - 145, 500, 
            'Press [ENTER] to play again.');

        // play reunion sound if not already played. fade distracting background music while sound effect is playing.
        // after that, play the end song.
        if (!this.reunionSound || !this.reunionSound.isPlaying) {
            this.add.tween({
                targets: this.gameSceneMusic,
                volume: 0,
                ease: 'Linear',
                duration: 250,
                onComplete: () => {
                    this.gameSceneMusic.stop();
                    this.reunionSound = this.sound.add('reunion', {volume: 1});
                    this.reunionSound.play();
                    this.reunionSound.on('complete', () => {
                        this.endMusic = this.sound.add('end-song', {loop: true, volume: 0.5});
                        this.endMusic.play()
                    });
                }
            });

        }

        // after scene fade out, transition to MainMenu
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.gameSceneMusic.stop(); // make double-triple sure music doesn't bleed into the next scene
            this.endMusic.stop(); // make double-triple sure music doesn't bleed into the next scene
            this.scene.start('MainMenu');
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            // fade out scene and music, ultimately transitioning to MainMenu. see "camerafadeoutcomplete"
            // listener in create().
            let fadeOutDuration = 1300;
            this.cameras.main.fadeOut(fadeOutDuration, 130, 130, 130);
            this.fading = true;
            // fade out music regardless of which music is currently playing
            this.add.tween({
                targets: this.gameSceneMusic,
                volume: 0,
                ease: 'Linear',
                duration: fadeOutDuration,
                onComplete: () => {
                    this.gameSceneMusic.stop();
                }
            });
            this.add.tween({
                targets: this.endMusic,
                volume: 0,
                ease: 'Linear',
                duration: fadeOutDuration,
                onComplete: () => {
                    this.endMusic.stop();
                }
            });
        }
    }
}