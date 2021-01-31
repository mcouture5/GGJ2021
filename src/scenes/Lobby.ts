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

    init(data: {room: string, mainMenuMusic: Phaser.Sound.BaseSound, playerName: string}) {

        this.data = data;

        this.fading = false;

        console.log(this.data.playerName);

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
        });
        Socket.listen(Socket.JOIN_ROOM_RESPONSE, (response: Response) => {
            console.log('join: ', response);
            GameManager.getInstance().setRoom(response);
            if (response.players.length == 2) {
                // fade out scene and music, ultimately transitioning to GameScene. see "camerafadeoutcomplete"
                // listener in create().
                let fadeOutDuration = 1300;
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
        let bg = this.add.sprite(0, 0, 'bg').setOrigin(0, 0);
        bg.displayWidth = GameManager.WINDOW_WIDTH;
        bg.displayHeight = GameManager.WINDOW_HEIGHT;

        let whitePig= this.add.sprite(300,  265, 'white_idle', 2);
        let orangePig = this.add.sprite(724,  265, 'orange_idle', 2);
        orangePig.scaleX*=-1;

        let fontStyle = {
            fontFamily: 'InkFree',
            fontSize: '22px',
            color: '#f2dd6e'
        };

        this.anims.create({
            key: 'orange-idle',
            frames: this.anims.generateFrameNumbers('orange_idle', { frames: [ 0, 1, 2 ]}),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: 'white-idle',
            frames: this.anims.generateFrameNumbers('white_idle', { frames: [ 0, 1, 2 ]}),
            frameRate: 3,
            repeat: -1
        });

        whitePig.play('white-idle', true);
        orangePig.play('orange-idle', true);

        if (this.data.room) {
            this.joinRoom(this.data.room);
        } else {
            let creating = this.add.text(GameManager.WINDOW_WIDTH/2.5, GameManager.WINDOW_HEIGHT/2 - 125, 'Creating a lobby...', fontStyle);
            this.createRoom();
            while(!GameManager.getInstance().getRoom()) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            creating.destroy();
            this.add.text(GameManager.WINDOW_WIDTH/2 - 140, GameManager.WINDOW_HEIGHT/2 - 120, 'Waiting for another player...', fontStyle);
            this.add.text(GameManager.WINDOW_WIDTH/2 - 80, GameManager.WINDOW_HEIGHT/2 - 75, 'Room Code:', fontStyle);

            this.add.text(GameManager.WINDOW_WIDTH/2 - 105, GameManager.WINDOW_HEIGHT/2 - 10, GameManager.getInstance().getRoom().room_id.toUpperCase(), {
                fontSize: '64px',
                color: '#f2dd6e'
            });
        }

        // after scene fade out, transition to GameScene
        this.cameras.main.once('camerafadeoutcomplete', (camera) => {
            this.data.mainMenuMusic.stop(); // make double-triple sure music doesn't bleed into the next scene
            this.scene.start('GameScene');
        });
    }

    update() {
    }
    
    /**
     * Sends a request to create a new room.
     */
    private createRoom() {
        Socket.emit(Socket.CREATE_ROOM, {
            name: this.data.playerName
        });
    }

    /**
     * Sends a request to join an existing room.
     * @param roomId
     */
    private joinRoom(roomId: string) {
        Socket.emit(Socket.JOIN_ROOM, {
            room: roomId.toLowerCase(),
            name: this.data.playerName
        });
    }

}
