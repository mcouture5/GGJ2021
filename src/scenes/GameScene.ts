// Phaser
import { Scene, Game, GameObjects } from 'phaser';

// Socket
import { Socket, Response, PigContext, Room } from '../Socket';

// Objects
import { DirtTile } from '../objects/DirtTile'
import { Pig } from '../objects/Pig'

// Layers
import { PigLayer } from '../layers/PigLayer';
import { GameManager } from '../GameManager';
import { CameraManager } from '../managers/CameraManager';

export class GameScene extends Scene {
    // Room
    private room: Room;

    // Tile layers
    private dirtLayer: Phaser.GameObjects.Container;
    private treasurelayer: Phaser.GameObjects.Container;
    private pigLayer: PigLayer;

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
        // Register all of the game managers
        GameManager.getInstance().registerManager(new CameraManager(this.cameras.main));

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
            // Move the other player.
            let players = response.players;
            // Move me
            let me = players.filter((player) => player.sid == Socket.getId())[0];
            this.pig.moveTo(me.x, me.y);

            // Find not me
            let notMe = players.filter((player) => player.sid !== Socket.getId())[0];
            this.otherPig.moveTo(notMe.x, notMe.y);
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

        this.pigLayer = new PigLayer(this);
        this.add.existing(this.pigLayer)
        
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
        this.createPig({
            id: 0,
            position: {
                x: 0, y: 0
            }
        });
        // End debugging
    }

    update() {
        this.cameras.main
    }
}
