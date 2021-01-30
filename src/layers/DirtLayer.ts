import { GameManager } from "../GameManager";
import { DirtTile } from "../objects/DirtTile";
import { Room } from "../Socket";

export class DirtLayer extends Phaser.GameObjects.Container {
    private dirt: Phaser.GameObjects.Sprite[] = [];

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
    }

    create() {
        // Create the tilemap
        let x = 0, y = 0;
        for (let i = 0; i < GameManager.WORLD_SIZE; i++) {
            x = 0;
            for (let j = 0; j < GameManager.WORLD_SIZE; j++) {
                let dirt = new DirtTile({ scene: this.scene, x: x, y: y, key: 'tile-64' });
                this.add(dirt);
                this.dirt.push(dirt);
                x+= GameManager.TILE_SIZE;
            }
            y+= GameManager.TILE_SIZE;
        }
    }

    update() {
    }

    onMove(room: Room) {
        
    }

}
