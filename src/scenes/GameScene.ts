// Phaser
import { Scene, Game, GameObjects } from 'phaser';

// Socket
import { Socket, Response, PigContext, Room } from '../Socket';

// Objects
import { DirtTile } from '../objects/DirtTile'
import { Pig } from '../objects/Pig'

export class GameScene extends Scene {
    // Room
    private room: Room;

    // Input keys
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;

    // Tile layers
    private dirtLayer: Phaser.GameObjects.Container;
    private treasurelayer: Phaser.GameObjects.Container;
    private playerLayer: Phaser.GameObjects.Container;

    // Object collections
    private dirt: GameObjects.Container[] = [];
    private treasure: GameObjects.Container[] = [];

    // Coordinates
    private coordinates: Array<number[]> = [];
    
    // Players
    private pig: Pig;
    private otherPig: Pig;

    private roomInput: string = '';

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init() {
        // Connect to websocket
        Socket.connect();

        // Listen for socket events
        Socket.listen(Socket.CREATE_ROOM_RESPONSE, (response: Response) => {
            this.room = response;
            console.log(this.room);
        });
        Socket.listen(Socket.JOIN_ROOM_RESPONSE, (response: Response) => {
            this.room = response;
            console.log(this.room);
        });


        /*
        Socket.listen('create_pig', (context: PigContext) => {
            this.createPig(context)
        });
*/
        // Debugging
        Socket.listen('connect', () => {
            console.log("connect");
            console.log(Socket.getId());
        })
        Socket.listen('disconnect', () => {
            console.log("disconnect");
            console.log(Socket.getId()); // undefined
        })
        Socket.listen(Socket.MOVE_RESPONSE, (response: Response) => {
            console.log('got move', response);
            /*
            let movex = response.new_coords.player1_coord_x;
            let movey = response.new_coords.player1_coord_y;
            this.otherPig.moveTo(movex, movey);*/
        });
        // End debugging
    }

    create() {
        // Create and add the tile layers
        this.dirtLayer = this.add.container(0, 0);
        this.treasurelayer = this.add.container(0, 0);
        this.playerLayer = this.add.container(0, 0);
        
        //new Phaser.GameObjects.Container(this, 0, 0);
        //this.treasurelayer = new Phaser.GameObjects.Container(this, 0, 0);
        //this.add.existing(this.dirtLayer);
        //this.add.existing(this.treasurelayer);

        // Pig layer
        //let pigs = new Phaser.GameObjects.Container(this, 0, 0);
        //this.add.existing(pigs);

        // Create the tilemap
        let x = 0, y = 0;
        for (let i = 0; i < 100; i++) {
            let arr = [];
            x = 0;
            for (let j = 0; j < 100; j++) {
                let tile =  this.dirtLayer.add(new DirtTile({ scene: this, x: x, y: y, key: 'tile-32' }));
                this.dirt.push(tile);
                x+= 32;
            }
            this.coordinates.push(arr);
            y+= 32;
        }

        // Debugging
        document.getElementById('createRoom').addEventListener('click', () => {
            this.createRoom();
        });
        document.getElementById('joinRoom').addEventListener('click', () => {
            this.joinRoom((document.getElementById('joinRoomInput') as any).value);
        });
        this.createPig({
            id: 0,
            position: {
                x: 0, y: 0
            }
        });
        // End debugging
    }

    update() {
        if (this.left && Phaser.Input.Keyboard.JustDown(this.left)) {
            this.moveLeft();
        }
        if (this.right && Phaser.Input.Keyboard.JustDown(this.right)) {
            this.moveRight();
        }
        if (this.up && Phaser.Input.Keyboard.JustDown(this.up)) {
            this.moveUp();
        }
        if (this.down && Phaser.Input.Keyboard.JustDown(this.down)) {
            this.moveDown();
        }
    }

    private moveLeft() {
        let rand = ['left', 'right', 'up', 'down'];
        this.pig.moveLeft();
        console.log('emitting left...');
        Socket.emit('move', {
            player: Socket.getId(),
            direction: rand[Math.floor(Math.random() * 4)]
        });
    }

    private moveRight() {
        let rand = ['left', 'right', 'up', 'down'];
        this.pig.moveRight();
        console.log('emitting right...');
        Socket.emit('move', {
            player: Socket.getId(),
            direction: rand[Math.floor(Math.random() * 4)]
        });
    }

    private moveUp() {
        let rand = ['left', 'right', 'up', 'down'];
        this.pig.moveUp();
        console.log('emitting up...');
        Socket.emit('move', {
            player: Socket.getId(),
            direction: rand[Math.floor(Math.random() * 4)]
        });
    }

    private moveDown() {
        let rand = ['left', 'right', 'up', 'down'];
        this.pig.moveDown();
        console.log('emitting down...');
        Socket.emit('move', {
            player: Socket.getId(),
            direction: rand[Math.floor(Math.random() * 4)]
        });
    }

    /**
     * Sends a request to create a new room.
     */
    private createRoom() {
        Socket.emit(Socket.CREATE_ROOM);
    }

    /**
     * Sends a request to join an existing room.
     * @param roomId
     */
    private joinRoom(roomId: string) {
        Socket.emit(Socket.JOIN_ROOM, {
            room: roomId
        });
    }

    /**
     * Creates a new pig. The context determines which pig to create and where to put it, etc.
     * 
     * The context is providied by the server.
     */
    private createPig(context: PigContext) {
        this.pig = new Pig({ scene: this, x: context.position.x, y: context.position.y, key: 'pig_' + context.id });
        this.playerLayer.add(this.pig);

        // Follow me!
        // this.cameras.main.zoom = 2;
        this.cameras.main.startFollow(this.pig, true, 0.075, 0.075);

        // Create the other pig too.
        this.otherPig = new Pig({ scene: this, x: 0, y: 0, key: 'pig_1' });
        this.playerLayer.add(this.otherPig);

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
    }
}
