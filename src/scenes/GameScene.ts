// Socket
import { Socket, Response, Room, Cave } from '../Socket';

// Layers
import { PigLayer } from '../layers/PigLayer';
import { DirtLayer } from '../layers/DirtLayer';
import { DugLayer } from '../layers/DugLayer';
import { GameManager } from '../GameManager';
import { DirtTile } from '../objects/DirtTile';
import { DugTile } from '../objects/DugTile';
import { Treasure } from '../objects/Treasure';
import { TreasureLayer } from '../layers/TreasureLayer';

export class GameScene extends Phaser.Scene {

    // Tile layers
    private dirtLayer: DirtLayer;
    private dugLayer: DugLayer;
    private pigLayer: PigLayer;

    private music: Phaser.Sound.BaseSound;

    public gem: Cave;
    public dino: Cave;

    private treasureLocation = {
        x: 25,
        y: 30
    };

    constructor() {
        super({
            key: 'GameScene'
        });
    }

    init() {        
        Socket.listen(Socket.MOVE_RESPONSE, (response: Response) => {
            this.onMove(response);
        });

        Socket.listen(Socket.RECEIVE_CHAT, (response: Response) => {
            this.displayChatMessage("", false);
        });

        Socket.listen(Socket.GAME_END, (r: any) => {
            this.scene.start('GameEnd', {elapsed_time: r.elapsed_time, gameSceneMusic: this.music});
        });

        Socket.listen(Socket.PLAYER_LEFT_ROOM, () => {
            this.scene.start('Disconnect');
        });

        document.getElementById('chat-send').addEventListener('click', () => {
            this.sendChat();
        });

        // Animations
        this.anims.create({
            key: 'dirt',
            frames: this.anims.generateFrameNumbers('dirt', { frames: [ 0, 1, 2, 3, 4, 5 ] }),
            frameRate: 0,
            repeat: 0
        });
        this.anims.create({
            key: 'orange_idle',
            frames: this.anims.generateFrameNumbers('orange_idle', { frames: [ 0, 1, 2 ] }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'white_idle',
            frames: this.anims.generateFrameNumbers('white_idle', { frames: [ 0, 1, 2 ] }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'orange_dig',
            frames: this.anims.generateFrameNumbers('orange_idle', { frames: [ 0, 1, 2 ] }),
            frameRate: 36,
            repeat: 1
        });
        this.anims.create({
            key: 'white_dig',
            frames: this.anims.generateFrameNumbers('white_idle', { frames: [ 0, 1, 2 ] }),
            frameRate: 36,
            repeat: 1
        });

        this.gem = GameManager.getInstance().getRoom().gem;
        this.dino = GameManager.getInstance().getRoom().dino;
    }

    create() {
        // start playing music if not already playing. fade it in.
        if (!this.music || !this.music.isPlaying) {
            this.music = this.sound.add('shanty-lyrical', {loop: true, volume: 0.1});
            this.music.play();
            this.add.tween({
                targets: this.music,
                volume: 0.2,
                ease: 'Linear',
                duration: 1300
            });
        }
        
        // Create and add the layers
        this.dugLayer = new DugLayer(this);
        this.add.existing(this.dugLayer);
        this.dugLayer.create();
        GameManager.getInstance().setDugLayer(this.dugLayer);
        
        this.dirtLayer = new DirtLayer(this);
        this.add.existing(this.dirtLayer);
        this.dirtLayer.create();
        GameManager.getInstance().setDirtLayer(this.dirtLayer);
        this.createLayers();
        this.cleanupLayers();

        this.pigLayer = new PigLayer(this);
        this.add.existing(this.pigLayer);
        this.pigLayer.create();
        GameManager.getInstance().setPigLayer(this.pigLayer);

        let chatElement = document.getElementById('chat');
        //chatElement.style.display = "block";
    }

    update() {
        this.dugLayer.update();
        this.dirtLayer.update();
        this.pigLayer.update();
    }

    onMove(room: Room) {
        // Tell only the pig layer about this move. It is responsible for communicating with the dirt layer.
        this.pigLayer.onMove(room);
    }


    sendChat() {
        let inputField = document.getElementById('chat-input');
        
        let message = inputField.innerText;

        if (message) {
            Socket.emit(Socket.SEND_CHAT, {
                player: Socket.getId(),
                message: message
            });

            this.displayChatMessage(message, true);
        }
    }

    displayChatMessage(message: string, myMessage: boolean) {
        let history: HTMLElement = document.getElementById('chat-history');

        let messageEl = document.createElement('span');
        if (myMessage) {
            messageEl.appendChild(document.createTextNode('Me: ' + message));
        } else {
            messageEl.appendChild(document.createTextNode('Them: ' + message));
        }
        
        history.appendChild(messageEl);
    }

    private createLayers() {
        // Create the tilemap
        let x = 0, y = 0;
        let yellowRows = 18;
        let yellowOrangeRows = 22;
        let orangeRows = 58;
        let orangeBrownRows = 62;
        let brownsRows = 88;
        let brownDarkRows = 92;
        let darkRows = 8;
        let isTransition = false;

        for (let i = 0; i < GameManager.WORLD_SIZE; i++) {
            x = 0;
            let dirtTiles = [], dugTiles = [], treasureTiles = [];
            let color = 'dark';
            isTransition = false;
            if (i < yellowRows) {
                color = 'yellow';
            } else if (i < yellowOrangeRows) {
                color = 'yellow_orange';
                isTransition = true;
            } else if (i < orangeRows) {
                color = 'orange';
            } else if (i < orangeBrownRows) {
                color = 'orange_brown';
                isTransition = true;
            } else if (i < brownsRows) {
                color = 'brown';
            } else if (i < brownDarkRows) {
                color = 'brown_dark';
                isTransition = true;
            }
            for (let j = 0; j < GameManager.WORLD_SIZE; j++) {
                // Dirt tile
                let dirt = new DirtTile({ scene: this, x: x, y: y }, j, i);
                this.dirtLayer.addTile(dirt);
                dirtTiles.push(dirt);

                // Create and add the dug layer sprite
                let dugTile = this.getRandomDugTile(isTransition, color, j, i);
                let dug = new DugTile(this, x, y, dugTile.tile).setOrigin(0.5,0.5);
                this.dugLayer.add(dug);
                dugTiles.push(dug);

                // Tiles that need to be deleted after drawing
                if (dugTile.isCave) {
                    this.dirtLayer.addToDelete(dirt); 
                }

                x+= GameManager.TILE_SIZE;
            }
            this.dirtLayer.tiles.push(dirtTiles);
            this.dugLayer.tiles.push(dugTiles);
            y+= GameManager.TILE_SIZE;
        }
    }

    private cleanupLayers() {
        this.dirtLayer.removeMarked();
    }

    private getRandomDugTile(isTransition: boolean, color: string, x: number, y: number): {
        isCave: boolean;
        tile: string;
    } {
        let isCavernTile = false;
        let randType = ['pebbles', 'roots', 'solid'][Math.floor(Math.random() * 3)];
        let randNum = Math.ceil(Math.random() * 8);
        if (isTransition) {
            randType = 'transition';
        }
        // Check for caves
        if (y >= this.gem.y && y <= this.gem.y + this.gem.h &&
            x >= this.gem.x && x <= this.gem.x + this.gem.w) {
            // Randomly choose to be a gem. Otherwise it will be the standard.
            if (Math.random() >= 0.5) {
                randType = ['emeralds', 'rubies', 'sapphires'][Math.floor(Math.random() * 3)];
            }

            // Regardless, make sure the dug tile is shown
            isCavernTile = true;
        }
        else if (y >= this.dino.y && y <= this.dino.y + this.dino.h &&
            x >= this.dino.x && x <= this.dino.x + this.dino.w) {
            if (Math.random() >= 0.5) {
                randType = 'dinosaur';
            }

            // Regardless, make sure the dug tile is shown
            isCavernTile = true;
        }
        let randTile = 'dug_' + color + '_' + randType;
        if (randType == 'pebbles' || randType == 'roots') {
            randTile += '_' + randNum;
        }
        return {
            isCave: isCavernTile,
            tile: randTile
        }
    }
}
