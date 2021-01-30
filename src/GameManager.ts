import { Room } from './Socket';

export class GameManager {
    private static instance: GameManager;
    private room: Room;
    private scene: Phaser.Scene;
    
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
    }

    public setRoom(room: Room) {
        this.room = room;
    }

    public getRoom() {
        return this.room;
    };
}
