import { GameManager } from "../GameManager";
import { DirtTile } from "../objects/DirtTile";
import { Player, Room, Socket } from "../Socket";
import { BoundedLayer } from "./BoundedLayer";

export class DirtLayer extends BoundedLayer {
    private digSound: Phaser.Sound.BaseSound;
    private pickaxe1Sound: Phaser.Sound.BaseSound;
    private pickaxe2Sound: Phaser.Sound.BaseSound;
    private lastDigSoundWasPickaxe: boolean;

    private toDelete: DirtTile[];

    constructor(scene: Phaser.Scene) {
        super(scene);
        this.toDelete = [];
    }

    create() {
        // Set the bounds of the camera so it does not show the outside of the map
        this.scene.cameras.main.setBounds(-GameManager.TILE_SIZE / 2,
            -GameManager.TILE_SIZE / 2,
            GameManager.WORLD_SIZE * GameManager.TILE_SIZE,
            GameManager.WORLD_SIZE * GameManager.TILE_SIZE);

        // create dig/pickaxe sounds
        this.digSound = this.scene.sound.add('dig', {volume: 0.25});
        this.pickaxe1Sound = this.scene.sound.add('pickaxe-1', {volume: 0.15});
        this.pickaxe2Sound = this.scene.sound.add('pickaxe-2', {volume: 0.05});
        this.lastDigSoundWasPickaxe = false;
    }

    update() {
    }

    public addTile(tile: DirtTile) {
        this.add(tile);
    }

    public addToDelete(tile: DirtTile) {
        this.toDelete.push(tile);
    }

    public removeMarked() {
        // Now remove all that were mared for deletion
        for (let tile of this.toDelete) {
            this.removeTile(tile);
        }
        this.toDelete = [];
    }

    isTileClearedAt(player: Player) {
        return !this.tiles[player.y][player.x];
    }

    onMove(room: Room) {
        room.players.forEach((playerCoord) => {
            let tile = this.tiles[playerCoord.y][playerCoord.x];
            if (tile) {
                this.removeTile(tile as DirtTile);

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

        tile.removeTile(this.tiles);

        // Remove the tile and its reference in the matrix
        this.tiles[tileYCoord][tileXCoord] = null;
        // this.remove(tile, true);
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
