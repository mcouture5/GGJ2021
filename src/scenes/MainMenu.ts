import { GameManager } from "../GameManager";

/**
 * Main menu.
 */
export class MainMenu extends Phaser.Scene {

    // Input keys
    private n: Phaser.Input.Keyboard.Key;
    private j: Phaser.Input.Keyboard.Key;

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
    
    }

    create() {
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 'Select an option to begin:');
        this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2, 'Create Game (n) or Join Game (j)');
    }

    update() {
        if (this.n && Phaser.Input.Keyboard.JustDown(this.n)) {
            this.scene.start('Lobby');
        }
        if (this.j && Phaser.Input.Keyboard.JustDown(this.j)) {
            let roomId = prompt("Enter the room id of the game you want to join");
            this.scene.start('Lobby', {room: roomId});
        }
    }
}
