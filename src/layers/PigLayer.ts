import { Pig } from '../objects/Pig';
import { Socket, PigContext } from '../Socket';

export class PigLayer extends Phaser.GameObjects.Container {
    // Input keys
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;

    private pigs: Pig[];

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
    }

    init() {
        this.pigs = [];
    }

    create() {

    }

    update() {
        if (this.left && Phaser.Input.Keyboard.JustDown(this.left)) {
            this.moveLeft();
        }
        if (this.right && Phaser.Input.Keyboard.JustDown(this.right)) {
            this.moveRight();
        }
        if (this.up && Phaser.Input.Keyboard.JustDown(this.up)) {
            this.movePigUp();
        }
        if (this.down && Phaser.Input.Keyboard.JustDown(this.down)) {
            this.movePigDown();
        }
    }

    /**
     * Creates a new pig. The context determines which pig to create and where to put it, etc.
     * 
     * The context is providied by the server.
     */
    private createPig(context: PigContext) {
        let pig = new Pig({ scene: this.scene, x: context.position.x, y: context.position.y, key: 'pig_' + context.id });
        this.add(pig);
        this.pigs.push(pig);
/*
        // Follow me!
        this.cameras.main.startFollow(this.pig, true, 0.075, 0.075);

        // Create the other pig too.
        this.otherPig = new Pig({ scene: this, x: 0, y: 0, key: 'pig_1' });
        this.add(this.otherPig);

        // Set up movement after we know we have a pig to move
        this.left = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.right = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.up = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP
        );
        this.down = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN
        );
        */
    }
    
    private moveLeft() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'left'
        });
    }

    private moveRight() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'right'
        });
    }

    private movePigUp() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'up'
        });
    }

    private movePigDown() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'down'
        });
    }
}
