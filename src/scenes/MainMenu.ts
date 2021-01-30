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

        // start playing music if not already playing. fade it in.
        if (!this.music || !this.music.isPlaying) {
            this.music = this.sound.add('shanty-instrumental', {loop: true, volume: 0.1});
            this.music.play();
            this.add.tween({
                targets: this.music,
                volume: 1,
                ease: 'Linear',
                duration: 1300
            });
        }

        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/4, 'Guinea Dig: Lost in Ground');
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/3.6, 'A tale of love lost and found', {fontSize: '12px'});

        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 'Select an option to begin:');
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2, 'Create Game (n) or Join Game (j)');
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/1.5, 'Learn how to play (h)');
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
