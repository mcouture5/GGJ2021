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

    private music: Phaser.Sound.BaseSound;

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
        // start playing music if not already playing. fade it in.
        if (!this.music) {
            let fadeInDuration = 1300;
            this.music = this.sound.add('shanty-lyrical', {loop: true, volume: 0.1});
            this.music.play();
            this.add.tween({
                targets: this.music,
                volume: 0.5,
                ease: 'Linear',
                duration: fadeInDuration
            });
        }

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
