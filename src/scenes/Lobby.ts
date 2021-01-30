import { GameManager } from '../GameManager';
import { Response, Socket } from '../Socket';

/**
 * Lobby containing the Create or Join room interface.
 */
export class Lobby extends Phaser.Scene {

    public data;

    constructor() {
        super({
            key: 'Lobby'
        });
    }

    init(data: {room: string}) {

        this.data = data;

        // Reset the room if playing again.
        GameManager.getInstance().setRoom(null);

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

            // TODO NOT THIS THIS IS FOR TESTING
            // this.scene.start('GameScene');
        });
        Socket.listen(Socket.JOIN_ROOM_RESPONSE, (response: Response) => {
            console.log('join: ', response);
            GameManager.getInstance().setRoom(response);
            if (response.players.length == 2) {
                this.scene.start('GameScene');
            }
        });
    }

    async create() {
        if (this.data.room) {
            this.joinRoom(this.data.room);
        } else {
            this.createRoom();
            while(!GameManager.getInstance().getRoom()) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 'Waiting for another player...');
            this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2, 'Room Code: ' + GameManager.getInstance().getRoom().room_id);
        }
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
