import { GameManager } from '../GameManager';
import { Response, Socket } from '../Socket';

/**
 * Lobby containing the Create or Join room interface.
 */
export class Lobby extends Phaser.Scene {

    public data;
    private fading: boolean;

    constructor() {
        super({
            key: 'Lobby'
        });
    }

    init(data: {room: string, mainMenuMusic: Phaser.Sound.BaseSound}) {

        this.data = data;

        this.fading = false;

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
                // fade out scene and music, ultimately transitioning to GameScene. see "camerafadeoutcomplete"
                // listener in create().
                let fadeOutDuration = 1300 ;
                this.cameras.main.fadeOut(fadeOutDuration, 130, 130, 130);
                this.fading = true;
                // fade out music
                this.add.tween({
                    targets: this.data.mainMenuMusic,
                    volume: 0,
                    ease: 'Linear',
                    duration: fadeOutDuration,
                    onComplete: () => {
                        this.data.mainMenuMusic.stop();
                    }
                });
            }
        });
    }

    async create() {
        if (this.data.room) {
            this.joinRoom(this.data.room);
        } else {
            let creating = this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 'Creating a lobby...');
            this.createRoom();
            while(!GameManager.getInstance().getRoom()) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            creating.destroy();
            this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2.25, 'Waiting for another player...');
            this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2, 'Room Code: ' + GameManager.getInstance().getRoom().room_id);
        }

        // after scene fade out, transition to GameScene
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.scene.start('GameScene');
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
