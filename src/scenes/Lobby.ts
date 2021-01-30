// Socket
import { GameManager } from '../GameManager';
import { Response, Socket } from '../Socket';

/**
 * Lobby containing the Create or Join room interface.
 */
export class Lobby extends Phaser.Scene {
    constructor() {
        super({
            key: 'Lobby'
        });
    }

    init() {
        // Connect to websocket
        Socket.connect();

        Socket.listen('connect', () => {
            console.log("connect");
            console.log(Socket.getId());
        })
        Socket.listen('disconnect', () => {
            console.log("disconnect");
            console.log(Socket.getId()); // undefined
        })

        // Listen for room response events
        Socket.listen(Socket.CREATE_ROOM_RESPONSE, (response: Response) => {
            console.log('create: ', response);
            GameManager.getInstance().setRoom(response);
        });
        Socket.listen(Socket.JOIN_ROOM_RESPONSE, (response: Response) => {
            console.log('join: ', response);
            GameManager.getInstance().setRoom(response);
            if (response.players.length == 2) {
                this.scene.start('GameScene');
            }
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
