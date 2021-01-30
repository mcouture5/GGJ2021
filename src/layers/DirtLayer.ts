import { GameManager } from "../GameManager";
import { DirtTile } from "../objects/DirtTile";
import { Player, Room, Socket } from "../Socket";

export class DirtLayer extends Phaser.GameObjects.Container {
    private dirt: Array<DirtTile[]>;

    private digSounds: Phaser.Sound.BaseSound[];

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.dirt = [];
    }

    create() {
        // Create the tilemap
        let x = 0, y = 0;
        let yellowRows = 18;
        let yellowOrangeRows = 22;
        let orangeRows = 58;
        let orangeBrownRows = 62;
        let brownsRows = 88;
        let brownDarkRows = 92;
        let darkRows = 8;
        let isTransition = false;
        for (let i = 0; i < GameManager.WORLD_SIZE; i++) {
            x = 0;
            let row = [];
            let color = 'dark';
            isTransition = false;
            if (i < yellowRows) {
                color = 'yellow';
            } else if (i < yellowOrangeRows) {
                color = 'yellow_orange';
                isTransition = true;
            } else if (i < orangeRows) {
                color = 'orange';
            } else if (i < orangeBrownRows) {
                color = 'orange_brown';
                isTransition = true;
            } else if (i < brownsRows) {
                color = 'brown';
            } else if (i < brownDarkRows) {
                color = 'brown_dark';
                isTransition = true;
            }
            for (let j = 0; j < GameManager.WORLD_SIZE; j++) {
                let dirt = new DirtTile({ scene: this.scene, x: x, y: y }, j, i);
                this.add(dirt);
                row.push(dirt);

                let randType = ['pebbles', 'roots', 'solid'][Math.floor(Math.random() * 3)];
                let randNum = Math.ceil(Math.random() * 8);

                if (isTransition) {
                    randType = 'transition';
                }

                let randTile = 'dug_' + color + '_' + randType;
                if (randType == 'pebbles' || randType == 'roots') {
                    randTile += '_' + randNum;
                }
                dirt.dugTile = randTile;

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
                let tileXCoord = tile.xCoord;
                let tileYCoord = tile.yCoord;

                // Modify the surrounding tiles before removing
                tile.informSurroundingTiles(this.dirt);

                // Draw the dug tile
                tile.drawDugTile();

                // Remove the tile and its reference in the matrix
                this.dirt[tileYCoord][tileXCoord] = null;
                this.remove(tile, true);

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
