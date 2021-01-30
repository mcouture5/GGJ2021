import { GameManager } from '../GameManager';
import { Pig } from '../objects/Pig';
import { Socket, PigContext, Room } from '../Socket';

export class PigLayer extends Phaser.GameObjects.Container {
    // Input keys
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;

    private pigs: { [sid:string]: Pig };

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.pigs = {};
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
        this.movePigs(room);
        this.checkDistance(room);
    }

    /**
     * Creates a new pig. The context determines which pig to create and where to put it, etc.
     * 
     * The context is providied by the server.
     */
    private createPigs(room: Room) {
        // Create the pigs, find mine, and tell the camera to follow it.
        room.players.forEach((player) => {
            let pig = new Pig({ scene: this.scene, x: 0, y: 0, key: 'pig_' + player.id });
            pig.sid = player.sid;
            this.add(pig);
            this.pigs[player.sid] = pig;
            // Follow me
            if (player.sid == Socket.getId()) {
                this.scene.cameras.main.startFollow(pig, true, 0.075, 0.075);
                this.scene.cameras.main.zoomTo(0.5);
            }
            pig.moveTo(player.x, player.y);
        });


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

    private movePigs(room: Room) {
        room.players.forEach((player) => {
            this.pigs[player.sid].moveTo(player.x, player.y);
        });
    }

    private checkDistance(room: Room) {
        let pig1 = room.players[0];
        let pig2 = room.players[1];
        
        let a = pig1.x - pig2.x;
        let b = pig1.y - pig2.y;
        let c = Math.sqrt( a*a + b*b );

        let zoomVal = Math.min(1.5, Math.max(0.5, (100 / c) / 10));
        this.scene.cameras.main.zoomTo(zoomVal, 700, 'Linear', true);
    }
}
