import { GameManager } from "../GameManager";
import { DirtTile } from "../objects/DirtTile";
import { Player, Room, Socket } from "../Socket";

export class DirtLayer extends Phaser.GameObjects.Container {
    private dirt: Array<DirtTile[]>;
    private dugTiles: Array<string[]>;

    private digSounds: Phaser.Sound.BaseSound[];

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.dirt = [];
        this.dugTiles = [];
    }

    create() {
        // Generate the keys for the dug tile layer.
        let yellowRows = 18;
        let yellowOrangeRows = 22;
        let orangeRows = 58;
        let orangeBrownRows = 62;
        let brownsRows = 88;
        let brownDarkRows = 92;
        let darkRows = 8;
        let isTransition = false;
        for (let ii = 0; ii < 100; ii++) {
            let arr = [];
            let color = 'dark';
            isTransition = false;
            if (ii < yellowRows) {
                color = 'yellow';
            } else if (ii < yellowOrangeRows) {
                color = 'yellow_orange';
                isTransition = true;
            } else if (ii < orangeRows) {
                color = 'orange';
            } else if (ii < orangeBrownRows) {
                color = 'orange_brown';
                isTransition = true;
            } else if (ii < brownsRows) {
                color = 'brown';
            } else if (ii < brownDarkRows) {
                color = 'brown_dark';
                isTransition = true;
            }
            for (let jj = 0; jj < 100; jj++) {
                let randType = ['pebbles', 'roots', 'solid'][Math.floor(Math.random() * 3)];
                let randNum = Math.ceil(Math.random() * 8);

                if (isTransition) {
                    randType = 'transition';
                }

                let randTile = 'dug_' + color + '_' + randType;
                if (randType == 'pebbles' || randType == 'roots') {
                    randTile += '_' + randNum;
                }
                arr.push(randTile);
            }
            this.dugTiles.push(arr);
        }

        // Create the tilemap
        let x = 0, y = 0;
        for (let i = 0; i < GameManager.WORLD_SIZE; i++) {
            x = 0;
            let row = [];
            for (let j = 0; j < GameManager.WORLD_SIZE; j++) {
                let dirt = new DirtTile({ scene: this.scene, x: x, y: y, key: 'tile-64' }, j, i);
                this.add(dirt);
                row.push(dirt);
                x+= GameManager.TILE_SIZE;
            }
            this.dirt.push(row);
            y+= GameManager.TILE_SIZE;
        }

        // Set the bounds of the camera so it does not show the outside of the map
        this.scene.cameras.main.setBounds(0, 0, GameManager.WORLD_SIZE * GameManager.TILE_SIZE, GameManager.WORLD_SIZE * GameManager.TILE_SIZE);

        // create dig sounds
        this.digSounds = [];
        for (let i = 1; i <= 4; i++) {
            this.digSounds.push(this.scene.sound.add(`dig-${i}`, {volume: 1}));
        }
    }

    update() {
    }

    isTileClearedAt(player: Player) {
        return !this.dirt[player.y][player.x];
    }

    onMove(room: Room) {
        room.players.forEach((playerCoord) => {
            let tile = this.dirt[playerCoord.y][playerCoord.x];
            if (tile) {
                // Grab the coords before killing it
                let tileX = tile.x;
                let tileY = tile.y;
                let tileXCoord = tile.xCoord;
                let tileYCoord = tile.yCoord;

                // Modify the surrounding tiles before removing
                tile.checkSurroundingTiles(this.dirt);

                // Remove the tile and its reference in the matric
                this.dirt[tileYCoord][tileXCoord] = null;
                this.remove(tile, true);

                // Add the dug background tile.
                let dugKey = this.dugTiles[playerCoord.y][playerCoord.x];
                let bgTile = new DirtTile({ scene: this.scene, x: tileX, y: tileY, key: dugKey }, tileXCoord, tileYCoord);
                this.add(bgTile);

                // play dig sound if this is the local player's pig
                if (playerCoord.sid === Socket.getId()) {
                    this.playDigSound();
                }
            }
        });
    }

    /**
     * Randomly selects a dig sound to play.
     */
    private playDigSound() {
        this.digSounds[Phaser.Math.Between(0, 3)].play();
    }
}
