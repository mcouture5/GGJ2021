import { GameManager } from "../GameManager";

/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {

    // Input keys
    private n: Phaser.Input.Keyboard.Key;
    private j: Phaser.Input.Keyboard.Key;
    private h: Phaser.Input.Keyboard.Key;

    private music: Phaser.Sound.BaseSound;

    constructor() {
        super({
            key: 'MainMenu'
        });
    }

    init() {
        this.j = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.J
        );
        this.n = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.N
        );
        this.h = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.H
        );
    }

    create() {
        // don't pause sound effects and music on blur.
        this.sound.pauseOnBlur = false;

        // start playing music if not already playing
        if (!this.music) {
            this.music = this.sound.add('shanty-instrumental', {loop: true, volume: 1});
            this.music.play();
        }

        let whitePig= this.add.sprite(300,  100, 'white-pig', 2);
        let orangePig = this.add.sprite(724,  100, 'orange-pig', 2);
        orangePig.scaleX*=-1;

        this.anims.create({
            key: 'orange-idle',
            frames: this.anims.generateFrameNumbers('orange-pig', { frames: [ 0, 1, 2 ]}),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'white-idle',
            frames: this.anims.generateFrameNumbers('white-pig', { frames: [ 0, 1, 2 ]}),
            frameRate: 3,
            repeat: -1
        });
 
        whitePig.play('white-idle', true);
        orangePig.play('orange-idle', true);

        this.add.text(390, 100, 'Guinea Dig: Lost in Ground');
        this.add.text(410, 125, 'A tale of love lost and found', {fontSize: '12px'});

        this.add.text(GameManager.WINDOW_WIDTH/2 - 120, 600, 'Select an option to begin:');
        this.add.text(GameManager.WINDOW_WIDTH/2 - 140, 650, 'Create Game (n)    Join Game (j)');
        this.add.text(GameManager.WINDOW_WIDTH/2 - 65, 675, 'How to Play (h)');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.n)) {
            this.scene.start('Lobby', {mainMenuMusic: this.music});
        }
        if (Phaser.Input.Keyboard.JustDown(this.j)) {
            let roomId = prompt("Enter the room id of the game you want to join");
            this.scene.start('Lobby', {room: roomId, mainMenuMusic: this.music});
        }
        if (Phaser.Input.Keyboard.JustDown(this.h)) {
            this.scene.start('HelpPage');
        }
    }
}
