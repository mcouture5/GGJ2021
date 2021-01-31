import { GameManager } from "../GameManager";
import { DirtTile } from "../objects/DirtTile";
import { Player, Room, Socket } from "../Socket";

export class DirtLayer extends Phaser.GameObjects.Container {
    private dirt: Array<DirtTile[]>;

    private digSound: Phaser.Sound.BaseSound;
    private pickaxe1Sound: Phaser.Sound.BaseSound;
    private pickaxe2Sound: Phaser.Sound.BaseSound;
    private lastDigSoundWasPickaxe: boolean;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.dirt = [];
    }

    private gemBounds = {
        x: Math.floor(Math.random() * 25) + 25,
        w: Math.floor(Math.random() * 10) + 5,
        y: Math.floor(Math.random() * 25) + 25,
        h: Math.floor(Math.random() * 10) + 5
    };

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

        // Keep track of ones we will delete
        let toDelete: DirtTile[] = [];
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
                let isCavernTile = false;
                let randType = ['pebbles', 'roots', 'solid'][Math.floor(Math.random() * 3)];
                let randNum = Math.ceil(Math.random() * 8);

                if (isTransition) {
                    randType = 'transition';
                }

                // Check for gem cavern
                if (i >= this.gemBounds.y && i <= this.gemBounds.y + this.gemBounds.h &&
                    j >= this.gemBounds.x && j <= this.gemBounds.x + this.gemBounds.w) {
                    // Randomly choose to be a gem. Otherwise it will be the standard.
                    if (Math.random() >= 0.5) {
                        randType = ['emeralds', 'rubies', 'sapphires'][Math.floor(Math.random() * 3)];
                    }

                    // Regardless, make sure the dug tile is shown
                    isCavernTile = true;
                }

                let randTile = 'dug_' + color + '_' + randType;
                if (randType == 'pebbles' || randType == 'roots') {
                    randTile += '_' + randNum;
                }

                // Create the dirt tile and assign its dug sprite
                let dirt = new DirtTile({ scene: this.scene, x: x, y: y }, j, i);
                this.add(dirt);
                row.push(dirt);
                dirt.dugTile = randTile;
                if (isCavernTile) {
                    toDelete.push(dirt);
                    console.log(randTile);    
                }

                x+= GameManager.TILE_SIZE;
            }
            this.dirt.push(row);
            y+= GameManager.TILE_SIZE;
        }

        // Now remove all that were mared for deletion
        for (let tile of toDelete) {
            this.removeTile(tile);
        }
        toDelete = null;

        // Set the bounds of the camera so it does not show the outside of the map
        this.scene.cameras.main.setBounds(-GameManager.TILE_SIZE / 2,
            -GameManager.TILE_SIZE / 2,
            GameManager.WORLD_SIZE * GameManager.TILE_SIZE,
            GameManager.WORLD_SIZE * GameManager.TILE_SIZE);

        // create dig/pickaxe sounds
        this.digSound = this.scene.sound.add('dig', {volume: 1});
        this.pickaxe1Sound = this.scene.sound.add('pickaxe-1', {volume: 0.75});
        this.pickaxe2Sound = this.scene.sound.add('pickaxe-2', {volume: 0.25});
        this.lastDigSoundWasPickaxe = false;
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
                this.removeTile(tile);

                // play dig sound if this is the local player's pig
                if (playerCoord.sid === Socket.getId()) {
                    this.playDigSound();
                }
            }
        });
    }

    private removeTile(tile: DirtTile) {
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
    }

    /**
     * Randomly selects a dig sound to play.
     */
    private playDigSound() {
        // roll a D8
        let roll = Phaser.Math.Between(1, 8);
        // 25% chance of fun pickaxe sound unless last sound was pickaxe
        if (roll >= 1 && roll <= 2 && !this.lastDigSoundWasPickaxe) {
            if (roll === 1) {
                this.pickaxe1Sound.play();
            } else {
                this.pickaxe2Sound.play();
            }
            this.lastDigSoundWasPickaxe = true;
        }
        // 75% chance of boring dig sound
        else {
            this.digSound.play();
            this.lastDigSoundWasPickaxe = false;
        }
    }
}
