import { GameManager } from "../GameManager";
import { LeaderboardLayer } from "../layers/LeaderboardLayer";


export class Leaderboard extends Phaser.Scene {

    // Input keys
    private enter: Phaser.Input.Keyboard.Key;

    private leaderboardLayer: LeaderboardLayer;

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

        this.leaderboardLayer = new LeaderboardLayer(this);
        this.add.existing(this.leaderboardLayer);
        this.leaderboardLayer.create();

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