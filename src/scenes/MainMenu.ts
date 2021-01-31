import { GameManager } from "../GameManager";

/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {
    private music: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'MainMenu'
        });
    }

    init() {
    }

    create() {
        let bg = this.add.sprite(0, 0, 'main_menu').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;

        this.showNameInput();

        // don't pause sound effects and music on blur.
        this.sound.pauseOnBlur = false;

        // start playing music if not already playing. fade it in.
        if (!this.music || !this.music.isPlaying) {
            this.music = this.sound.add('shanty-instrumental', {loop: true, volume: 0.1});
            this.music.play();
            this.add.tween({
                targets: this.music,
                volume: 0.75,
                ease: 'Linear',
                duration: 1300
            });
        }

        let whitePig= this.add.sprite(300,  165, 'white_idle', 2);
        let orangePig = this.add.sprite(724,  165, 'orange_idle', 2);
        orangePig.scaleX*=-1;

        this.anims.create({
            key: 'orange-idle',
            frames: this.anims.generateFrameNumbers('orange_idle', { frames: [ 0, 1, 2 ]}),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'white-idle',
            frames: this.anims.generateFrameNumbers('white_idle', { frames: [ 0, 1, 2 ]}),
            frameRate: 3,
            repeat: -1
        });
 
        whitePig.play('white-idle', true);
        orangePig.play('orange-idle', true);

        let createGameBtn = this.add.rectangle(373, 317, 207, 105, 0xffffff, 0);
        createGameBtn.setInteractive({useHandCursor: true});
        createGameBtn.on('pointerup', () => {
            this.hideNameInput();
            this.scene.start('Lobby', {mainMenuMusic: this.music, playerName: (document.getElementById('name-input') as any).value});
        });

        let joinGameBtn = this.add.rectangle(640, 317, 220, 105, 0xffffff, 0);
        joinGameBtn.setInteractive({useHandCursor: true});
        joinGameBtn.on('pointerup', () => {
            let roomId = prompt("Enter the room id of the game you want to join");
            if (roomId) {
                this.hideNameInput();
                this.scene.start('Lobby', {room: roomId, mainMenuMusic: this.music, playerName: (document.getElementById('name-input') as any).value});
            }
        });

        let howToPlayBtn = this.add.rectangle(509, 432, 490, 100, 0xffffff, 0);
        howToPlayBtn.setInteractive({useHandCursor: true});
        howToPlayBtn.on('pointerup', () => {
            this.hideNameInput();
            this.scene.start('HelpPage');
        });

        let leaderboardBtn = this.add.rectangle(509, 549, 490, 87, 0xffffff, 0);
        leaderboardBtn.setInteractive({useHandCursor: true});
        leaderboardBtn.on('pointerup', () => {
            this.hideNameInput();
            this.scene.start('Leaderboard');
        });
    }

    update() {
    }

    private showNameInput() {
        document.getElementById('name-input-prompt').style.display = "block";
    }
    
    private hideNameInput() {
        document.getElementById('name-input-prompt').style.display = "none";
    }
}
