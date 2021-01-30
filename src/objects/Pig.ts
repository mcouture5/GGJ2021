import { GameManager } from "../GameManager";

interface PigContext {
    idle: string;
    dig: string;
}

export interface IPig {
    scene: Phaser.Scene;
    x: number;
    y: number;
    id: number;
}

export class Pig extends Phaser.GameObjects.Sprite  {

    private readonly 

    private size: number = GameManager.TILE_SIZE;

    private tileX: number = 0;
    private tileY: number = 0;

    /**
     * Player SID
     */
    public sid: string;
    private pigId: number;

    // A move request has been sent, and we are waiting for the animation to finish. Test for truthiness of this.
    private waitingToMove: {x: number, y: number };
    private awaitingMoveCallback;

    // Pig info
    public static PIG_CONTEXT: { [key: number ]: PigContext} = {
        0: {
            idle: 'orange_idle',
            dig: 'orange_dig'
        },
        1: {
            idle: 'white_idle',
            dig: 'white_dig'
        },
    };
    
    constructor(params: IPig) {
        super(params.scene, params.x, params.y, Pig.PIG_CONTEXT[params.id].idle);
        this.pigId = params.id;
        this.setOrigin(0, 0);
        this.setScale(0.5, 0.5);
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            // Because there may be more than one animation on the pig, and this event gets fired after any animation is
            // done playing, we need to determine the next action based on the current state of the pig.
            if (this.waitingToMove) {
                if (this.awaitingMoveCallback) {
                    this.awaitingMoveCallback();
                    this.awaitingMoveCallback = null;
                }
                this.doMove();
            }
        });
    }

    update(): void {
    }

    public canMove() {
        return !this.waitingToMove;
    }

    /**
     * Moves to the tile based x-y coordinates. Ex: passing in 1,1 will move to screen location 32,32 (or whatever tile size is set).
     * 
     * The movement occurs after the animation has finished playing. During that time, input will be blocked.
     * 
     * @param callback invoked after the dig animation is complete.
     */
    public moveTo(x: number, y: number, playAnimation: boolean, callback?: () => void) {
        this.waitingToMove = { x: x, y: y };
        if (!playAnimation) {
            this.doMove();
            callback && callback();
        } else {
            this.awaitingMoveCallback = callback;
            this.play(Pig.PIG_CONTEXT[this.pigId].dig);
        }
    }

    private doMove() {
        this.setX(this.waitingToMove.x * GameManager.TILE_SIZE);
        this.setY(this.waitingToMove.y * GameManager.TILE_SIZE);
        this.tileX = this.waitingToMove.x;
        this.tileY = this.waitingToMove.y;

        // Done moving
        this.waitingToMove = null;

        // Start idling
        this.play(Pig.PIG_CONTEXT[this.pigId].idle);
    }
}
