import { Tile } from "./Tile";

export class Treasure extends Tile {

    public grab() {
        this.scene.cameras.main.zoomTo(0.35, 700, 'Linear', true);
    }

}
