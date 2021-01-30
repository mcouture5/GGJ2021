import { GameManager } from "../GameManager";

export interface IPig {
    scene: Phaser.Scene;
    x: number,
    y: number;
    key?: string;
    frame?: number;
}

export class Pig extends Phaser.GameObjects.Sprite  {
    private tileX: number = 0;
    private tileY: number = 0;

    /**
     * Player SID
     */
    public sid: string;

    // A move request has been sent, and we are waiting for the animation to finish. Test for truthiness of this.
    private waitingToMove: {x: number, y: number };

    constructor(params: IPig) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.setOrigin(0, 0);
        this.scene.anims.create({
            key: 'dig',
            frames: this.scene.anims.generateFrameNumbers('hero', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 32,
            repeat: 0
        });
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            // Because there may be more than one animation on the pig, and this event gets fired after any animation is
            // done playing, we need to determine the next action based on the current state of the pig.
            if (this.waitingToMove) {
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
     */
    public moveTo(x: number, y: number) {
        this.play('dig');
        this.waitingToMove = { x: x, y: y };
    }

    private doMove() {
        this.setX(this.waitingToMove.x * GameManager.TILE_SIZE);
        this.setY(this.waitingToMove.y * GameManager.TILE_SIZE);
        this.tileX = this.waitingToMove.x;
        this.tileY = this.waitingToMove.y;

        // Done moving
        this.waitingToMove = null;
    }
}
