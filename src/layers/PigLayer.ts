import { GameManager } from '../GameManager';
import { Pig } from '../objects/Pig';
import { Socket, PigContext, Room } from '../Socket';

export class PigLayer extends Phaser.GameObjects.Container {
    // Input keys
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;

    private myPig: Pig;
    private theirPig: Pig;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
    }

    create() {
        this.createPigs(GameManager.getInstance().getRoom());
    }

    update() {
        if (this.left && Phaser.Input.Keyboard.JustDown(this.left)) {
            this.movePigLeft();
        }
        if (this.right && Phaser.Input.Keyboard.JustDown(this.right)) {
            this.movePigRight();
        }
        if (this.up && Phaser.Input.Keyboard.JustDown(this.up)) {
            this.movePigUp();
        }
        if (this.down && Phaser.Input.Keyboard.JustDown(this.down)) {
            this.movePigDown();
        }
    }

    public onMove(room: Room) {
        let players = room.players;
        // Move me
        let me = players.filter((player) => player.sid == Socket.getId())[0];
        this.myPig.moveTo(me.x, me.y);

        // Move not me
        let notMe = players.filter((player) => player.sid !== Socket.getId())[0];
        this.theirPig.moveTo(notMe.x, notMe.y);
    }

    /**
     * Creates a new pig. The context determines which pig to create and where to put it, etc.
     * 
     * The context is providied by the server.
     */
    private createPigs(room: Room) {
        // Create the pigs, find mine, and tell the camera to follow it.
        room.players.forEach((player) => {
            let pig = new Pig({ scene: this.scene, x: player.x, y: player.y, key: 'pig_' + player.id });
            this.add(pig);
            if (player.sid == Socket.getId()) {
                this.myPig = pig;
            } else {
                this.theirPig = pig;
            }
        });

        // Follow me
        this.scene.cameras.main.startFollow(this.myPig, true, 0.075, 0.075);

        // Set up movement after we know we have a pig to move
        this.left = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.right = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.up = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP
        );
        this.down = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN
        );
    }
    
    private movePigLeft() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'left'
        });
    }

    private movePigRight() {
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
