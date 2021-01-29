// Socket
import { GameManager } from '../managers/GameManager';
import { Response, Socket } from '../Socket';

/**
 * Lobby containing the Create or Join room interface.
 */
export class Boot extends Phaser.Scene {
    constructor() {
        super({
            key: 'Lobby'
        });
    }

    init() {
        // Connect to websocket
        Socket.connect();

        // Listen for room response events
        Socket.listen(Socket.CREATE_ROOM_RESPONSE, (response: Response) => {
            GameManager.getInstance().setRoom(response);
        });
        Socket.listen(Socket.JOIN_ROOM_RESPONSE, (response: Response) => {
            GameManager.getInstance().setRoom(response);
        });
    }

    create() {
        document.getElementById('createRoom').addEventListener('click', () => {
            this.createRoom();
        });
        document.getElementById('joinRoom').addEventListener('click', () => {
            this.joinRoom((document.getElementById('joinRoomInput') as any).value);
        });
    }

    update() {
        // Immediately start the main menu
        // this.scene.start('GameScene');
    }
    
    /**
     * Sends a request to create a new room.
     */
    private createRoom() {
        Socket.emit(Socket.CREATE_ROOM);
    }

    /**
     * Sends a request to join an existing room.
     * @param roomId
     */
    private joinRoom(roomId: string) {
        Socket.emit(Socket.JOIN_ROOM, {
            room: roomId.toLowerCase()
        });
    }

}
