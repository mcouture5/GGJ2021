import { GameManager } from "../GameManager";
import { DirtTile } from "../objects/DirtTile";
import { Tile } from "../objects/Tile";
import { Player, Room, Socket } from "../Socket";

export class BoundedLayer extends Phaser.GameObjects.Container {

    public tiles: Array<Tile[]>;
    
    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        this.tiles = [];
    }

    /**
     * Renders additional tiles around the player. Only does this when moving the main pig.
     * 
     * On every move, 20 tiles from both sides of the pig are rendered.
     */
    public renderBounds(room: Room) {
        // Get my current x and y tile coords
        let me = room.players.filter((player) => player.sid === Socket.getId())[0];

        // Remove all tiles to redraw
        this.removeAll(false);

        // Draw all tiles within a range from me
        for (let i = -25; i < 25; i++) {
            for (let j = -25; j < 25; j++) {
                let row = this.tiles[me.y + i];
                if (row) {
                    let tile = this.tiles[me.y + i][me.x + j];
                    if (tile) {
                        tile.draw(this);
                    }
                }
            }
        }
    }
}
