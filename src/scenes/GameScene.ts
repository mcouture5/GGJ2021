// Socket
import { Socket, Response, Room } from '../Socket';

// Objects
import { Pig } from '../objects/Pig'

// Layers
import { PigLayer } from '../layers/PigLayer';
import { DirtLayer } from '../layers/DirtLayer';

export class GameScene extends Phaser.Scene {

    // Tile layers
    private dirtLayer: DirtLayer;
    private treasurelayer: Phaser.GameObjects.Container;
    private pigLayer: PigLayer;

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init() {
        Socket.listen(Socket.MOVE_RESPONSE, (response: Response) => {
            this.onMove(response);
        });
    }

    create() {
        // Create and add the layers
        this.dirtLayer = new DirtLayer(this);
        this.add.existing(this.dirtLayer);
        this.dirtLayer.create();

        this.pigLayer = new PigLayer(this);
        this.add.existing(this.pigLayer);
        this.pigLayer.create();
    }

    update() {
        this.dirtLayer.update();
        this.pigLayer.update();
    }

    onMove(room: Room) {
        // Tell the layers about this move
        this.dirtLayer.onMove(room);
        this.pigLayer.onMove(room);
        this.dirtLayer.onMove(room);
    }
}
