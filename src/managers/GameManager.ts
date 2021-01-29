import { Room } from '../Socket';

export class GameManager {
    private static instance: GameManager;
    private room: Room;
    private scene: Phaser.Scene;

    // All of the other managers for the game
    private managers: Manager[];

    // Singleton baby
    public static getInstance() {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager();
        }
        return GameManager.instance;
    }

    constructor() {
        this.managers = [];
    }

    public setRoom(room: Room) {
        this.room = room;
    }

    public registerManager(manager: Manager) {
        this.managers.push(manager);
    }

    public setActivePig() {

    }

    /**
     * Entry point to the actual game. This is called after both players have readied up. It will create the world, the
     * pigs, and everything else.
     */
    public createGame() {
        
    }
}
