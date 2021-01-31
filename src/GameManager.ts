import { DirtLayer } from './layers/DirtLayer';
import { DugLayer } from './layers/DugLayer';
import { PigLayer } from './layers/PigLayer';
import { TreasureLayer } from './layers/TreasureLayer';
import { Room } from './Socket';

/**
 * MrWizard...
 */
export class GameManager {
    private static instance: GameManager;
    private room: Room;
    private layers: { [key: string]: Phaser.GameObjects.Container };
    
    // World Size
    public static WORLD_SIZE: number = 100;
    public static TILE_SIZE: number = 64;

    public static WINDOW_WIDTH: number = 1024;
    public static WINDOW_HEIGHT: number = 768;

    // Singleton baby
    public static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    constructor() {
        this.layers = {};
    }

    public setDugLayer(layer: DugLayer) {
        this.layers['dug'] = layer;
    }
    public setDirtLayer(layer: DirtLayer) {
        this.layers['dirt'] = layer;
    }
    public setPigLayer(layer: PigLayer) {
        this.layers['pig'] = layer;
    }

    public getDugLayer(): DugLayer {
        return this.layers['dug'] as DugLayer;
    }
    public getDirtLayer(): DirtLayer {
        return this.layers['dirt'] as DirtLayer;
    }
    public getPigLayer(): PigLayer {
        return this.layers['pig'] as PigLayer;
    }

    public setRoom(room: Room) {
        this.room = room;
    }

    public getRoom() {
        return this.room;
    };

    public renderBounds(room) {
        this.getDirtLayer().renderBounds(room);
        this.getDugLayer().renderBounds(room);
    }

    
    public onMove(room) {
        this.getDirtLayer().onMove(room);
    }
}
