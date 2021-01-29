// Socket
import { io } from 'socket.io-client';

// Objects
import { DirtTile } from '../objects/DirtTile'
import { Pig } from '../objects/Pig'

export class MikesTestBed extends Phaser.Scene {

    private readonly socket;
    private left: Phaser.Input.Keyboard.Key;
    private right: Phaser.Input.Keyboard.Key;
    private up: Phaser.Input.Keyboard.Key;
    private down: Phaser.Input.Keyboard.Key;

    private tilemap: Array<number[]> = [];

    private pig: Pig;

    constructor() {
        super({
            key: 'MikesTestBed'
        });
        this.socket = io('http://guineadig.parlette.org:5000/socket.io/', {
            withCredentials: true,
            timeout: 1000,
            transports: ['websocket']
          });
        this.socket.on("connect", () => {
            console.log("connect");
            console.log(this.socket.id);
        });
        this.socket.on("disconnect", () => {
            console.log("disconnect");
            console.log(this.socket.id); // undefined
        });
        this.socket.on("hello", (arg) => {
            console.log("Got emit!");
            console.log(arg);
        });
    }

    init() {
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

    create() {
        // Create and add the tile layers
        let tile_0 = new Phaser.GameObjects.Container(this, 0, 0);
        this.add.existing(tile_0);

        // Pig layer
        let pigs = new Phaser.GameObjects.Container(this, 0, 0);
        this.add.existing(pigs);

        // Create the tilemap
        let x = 0, y = 0;
        for (let i = 0; i < 100; i++) {
            let arr = [];
            x = 0;
            for (let j = 0; j < 100; j++) {
                let tile = new DirtTile({ scene: this, x: x, y: y, key: 'tile-32' });
                tile_0.add(tile);
                // this.tiles.push(dr);
                x+= 32;
            }
            y+= 32;
            this.tilemap.push(arr);
        }

        // Create the pigs
        let hePig = new Pig({ scene: this, x: 0, y: 0, key: 'he-pig' });
        pigs.add(hePig);
        hePig.moveTo(5, 5);
        let shePig = new Pig({ scene: this, x: 0, y: 0, key: 'she-pig' });
        pigs.add(shePig);
        shePig.moveTo(10, 5);

        this.pig = hePig;
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.left)) {
            this.pig.moveLeft();
            this.socket.emit("move", {
                player: "Wy2J-2z3EnI5-yBwAABP",
                direction: "left"
            });
        }
        if (Phaser.Input.Keyboard.JustDown(this.right)) {
            this.pig.moveRight();
            this.socket.emit("move", {
                player: "Wy2J-2z3EnI5-yBwAABP",
                direction: "right"
            });
        }
        if (Phaser.Input.Keyboard.JustDown(this.up)) {
            this.pig.moveUp();
            this.socket.emit("move", {
                player: "Wy2J-2z3EnI5-yBwAABP",
                direction: "up"
            });
        }
        if (Phaser.Input.Keyboard.JustDown(this.down)) {
            this.pig.moveDown();
            this.socket.emit("move", {
                player: "Wy2J-2z3EnI5-yBwAABP",
                direction: "down"
            });
        }
    }
}
