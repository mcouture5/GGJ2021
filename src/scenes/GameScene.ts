// Socket
import { Socket, Response, Room } from '../Socket';

// Layers
import { PigLayer } from '../layers/PigLayer';
import { DirtLayer } from '../layers/DirtLayer';
import { GameManager } from '../GameManager';

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

        Socket.listen(Socket.GAME_END, () => {
            this.scene.start('GameEnd');
        });
    }

    create() {
        // Create and add the layers
        this.dirtLayer = new DirtLayer(this);
        this.add.existing(this.dirtLayer);
        this.dirtLayer.create();
        GameManager.getInstance().setDirtLayer(this.dirtLayer);

        this.pigLayer = new PigLayer(this);
        this.add.existing(this.pigLayer);
        this.pigLayer.create();
        GameManager.getInstance().setPigLayer(this.pigLayer);
    }

    update() {
        this.dirtLayer.update();
        this.pigLayer.update();
    }

    onMove(room: Room) {
        // Tell only the pig layer about this move. It is responsible for communicating with the dirt layer.
        this.pigLayer.onMove(room);
    }
}
