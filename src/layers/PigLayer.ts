import { GameManager } from '../GameManager';
import { Pig } from '../objects/Pig';
import {Socket, Room, Player, Cave} from '../Socket';
import { GameScene } from "../scenes/GameScene";

export class PigLayer extends Phaser.GameObjects.Container {

    private static readonly MIN_ZOOM_LEVEL = 0.75;

    // Input keys
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;

    private pigs: { [sid:string]: Pig };

    // whether a "move" socket event is currently pending, prevents duplicate events from being issued
    private movePending: boolean;

    // sound effects
    private gemCaveSound: Phaser.Sound.BaseSound;
    private dinoCaveSound: Phaser.Sound.BaseSound;
    private gemCaveExplored: boolean;
    private dinoCaveExplored: boolean;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.pigs = {};
        this.movePending = false;
    }

    create() {
        this.createPigs(GameManager.getInstance().getRoom());

        // create sound effects
        this.gemCaveSound = this.scene.sound.add('treasure', {volume: 0.75});
        this.dinoCaveSound = this.scene.sound.add('dinosaur', {volume: 0.75});
        this.gemCaveExplored = false;
        this.dinoCaveExplored = false;
    }

    update() {
        if (this.left && Phaser.Input.Keyboard.JustDown(this.left)) {
            if (!this.canMove()) {
                return;
            }
            this.movePigLeft();
        }
        if (this.right && Phaser.Input.Keyboard.JustDown(this.right)) {
            if (!this.canMove()) {
                return;
            }
            this.movePigRight();
        }
        if (this.up && Phaser.Input.Keyboard.JustDown(this.up)) {
            if (!this.canMove()) {
                return;
            }
            this.movePigUp();
        }
        if (this.down && Phaser.Input.Keyboard.JustDown(this.down)) {
            if (!this.canMove()) {
                return;
            }
            this.movePigDown();
        }
    }

    /**
     * The player can move only if their pig is not currently moving.
     */
    private canMove() {
        let myPig = this.pigs[Socket.getId()];
        return myPig.canMove() && !this.movePending;
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
            let pig = new Pig({ scene: this.scene, x: 0, y: 0, id: player.id });
            // let pig = new Pig({ scene: this.scene, x: 0, y: 0, key: 'hero' });
            pig.sid = player.sid;
            this.add(pig);
            this.pigs[player.sid] = pig;
            pig.moveTo(player.x, player.y, false);
            // Follow me
            if (player.sid == Socket.getId()) {
                this.scene.cameras.main.pan(pig.x, pig.y, 0);
                this.scene.cameras.main.startFollow(pig, true, 0.075, 0.075);
                this.scene.cameras.main.zoomTo(PigLayer.MIN_ZOOM_LEVEL, 0);
            }
        });

        // Tell the dirt layer the pigs have moved
        GameManager.getInstance().onMove(room);
        GameManager.getInstance().renderBounds(room);

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
        this.movePending = true;
    }

    private movePigRight() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'right'
        });
        this.movePending = true;
    }

    private movePigUp() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'up'
        });
        this.movePending = true;
    }

    private movePigDown() {
        Socket.emit('move', {
            player: Socket.getId(),
            direction: 'down'
        });
        this.movePending = true;
    }

    private movePigs(room: Room) {
        this.movePending = false;
        let dirtLayer = GameManager.getInstance().getDirtLayer();
        let treasureLayer = GameManager.getInstance().getTreasureLayer();
        room.players.forEach((player) => {
            // Ask the dirt layer what tile we will be moving into. Things will happen depending on the answer.
            if (dirtLayer.isTileClearedAt(player)) {
                // If no tile, go forth with the move as scheduled
                this.pigs[player.sid].moveTo(player.x, player.y, false);
                // If this is my player...
                if (player.sid === Socket.getId()) {
                    // render the world around me
                    GameManager.getInstance().renderBounds(room);
                    // play appropriate cave sound effects if needed
                    if (this.playerIsInsideCave(player, (this.scene as GameScene).gem) && !this.gemCaveExplored) {
                        this.gemCaveSound.play()
                        this.gemCaveExplored = true;
                    } else if (this.playerIsInsideCave(player, (this.scene as GameScene).dino) && !this.dinoCaveExplored) {
                        this.dinoCaveSound.play();
                        this.dinoCaveExplored = true;
                    }
                }
                treasureLayer.onMove(room);
            } else {
                // Start the animation. When that is finished, the tile can be removed. Only animate if current players pig.
                let playAnimation = player.sid === Socket.getId();
                this.pigs[player.sid].moveTo(player.x, player.y, playAnimation, () => {
                    GameManager.getInstance().onMove(room);
                    // If this is my player, render the world around me
                    if (player.sid === Socket.getId()) {
                        GameManager.getInstance().renderBounds(room);
                    }
                });
            }
        });
    }

    private checkDistance(room: Room) {
        let pig1 = room.players[0];
        let pig2 = room.players[1];
        
        let a = pig1.x - pig2.x;
        let b = pig1.y - pig2.y;
        let c = Math.sqrt( a*a + b*b );

        let zoomVal = Math.min(1.5, Math.max(PigLayer.MIN_ZOOM_LEVEL, (100 / c) / 10));
        this.scene.cameras.main.zoomTo(zoomVal, 700, 'Linear', true);
    }

    /**
     * Is the provided player position inside the provided cave?
     */
    private playerIsInsideCave(player: Player, cave: Cave): boolean {
        let caveRight = cave.x + cave.w;
        let caveBottom = cave.y + cave.h;

        if (player.x < cave.x) {
            return false;
        } else if (player.x > caveRight) {
            return false;
        } else if (player.y < cave.y) {
            return false;
        } else if (player.y > caveBottom) {
            return false;
        } else {
            return true;
        }
    }
}
