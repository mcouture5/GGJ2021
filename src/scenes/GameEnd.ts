import { GameManager } from "../GameManager";
import { LeaderboardLayer } from "../layers/LeaderboardLayer";

/**
 * Leaderboard/credits
 */
export class GameEnd extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    private timeElapsed: number;

    private fading: boolean;

    private gameSceneMusic: Phaser.Sound.BaseSound;
    private reunionSound: Phaser.Sound.BaseSound;

    private leaderboardLayer: LeaderboardLayer;   

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

        let fontStyle = {
            fontFamily: 'InkFree',
            fontSize: '22px',
            color: '#f2dd6e'
        };

        // Todo: change this artwork once the leaderboard is added
        let bg = this.add.sprite(0, 0, 'leaderboard_end_screen').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;


        this.leaderboardLayer = new LeaderboardLayer(this);
        this.add.existing(this.leaderboardLayer);
        this.leaderboardLayer.create();

        let time = new String(this.timeElapsed).slice(0,5);
        this.add.text(GameManager.WINDOW_WIDTH/2 - 220, 580, 
            `Congratulations! You finished in ${time} seconds.`, fontStyle);
        
        let mainMenuBtn = this.add.rectangle(109, 349, 207, 105, 0xffffff, 0);
        mainMenuBtn.setInteractive({useHandCursor: true});
        mainMenuBtn.on('pointerup', () => {
           this.fadeOut();
        });

        // play reunion sound if not already played. fade distracting background music while sound effect is playing.
        if (!this.reunionSound || !this.reunionSound.isPlaying) {
            this.add.tween({
                targets: this.gameSceneMusic,
                volume: 0,
                ease: 'Linear',
                duration: 250,
                onComplete: () => {
                    this.reunionSound = this.sound.add('reunion', {volume: 1});
                    this.reunionSound.play();
                    this.reunionSound.on('complete', () => {
                        this.gameSceneMusic.resume();
                        this.add.tween({
                            targets: this.gameSceneMusic,
                            volume: 0.2,
                            ease: 'Linear',
                            duration: 250
                        });
                    });
                }
            });

        }

        // after scene fade out, transition to MainMenu
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.gameSceneMusic.stop(); // make double-triple sure music doesn't bleed into the next scene
            this.scene.start('MainMenu');
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enter)) {
            this.fadeOut();
        }
    }

    private fadeOut() {
        // fade out scene and music, ultimately transitioning to MainMenu. see "camerafadeoutcomplete"
        // listener in create().
        let fadeOutDuration = 1300;
        this.cameras.main.fadeOut(fadeOutDuration, 130, 130, 130);
        this.fading = true;
        // fade out music
        this.add.tween({
            targets: this.gameSceneMusic,
            volume: 0,
            ease: 'Linear',
            duration: fadeOutDuration,
            onComplete: () => {
                this.gameSceneMusic.stop();
            }
        });
    }
}