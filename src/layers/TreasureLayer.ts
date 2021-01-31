import { Room, Socket } from "../Socket";
import { BoundedLayer } from "./BoundedLayer";
import { Treasure } from "../objects/Treasure";

export class TreasureLayer extends BoundedLayer {

    onMove(room: Room) {
        room.players.forEach((playerCoord) => {
            let tile = this.tiles[playerCoord.y][playerCoord.x];
            if (tile) {
                if (playerCoord.sid === Socket.getId()) {
                    (tile as Treasure).grab();
                }
                this.remove(tile, true);
                this.tiles[playerCoord.y][playerCoord.x] = null;
            }
        });
    }

}
