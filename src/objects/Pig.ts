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

    constructor(params: IPig) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        this.setOrigin(0, 0);
        this.setScale(2, 2);
    }

    update(): void {
    }

    moveLeft() {
        this.moveTo(this.tileX - 1, this.tileY);
    }

    moveRight() {
        this.moveTo(this.tileX + 1, this.tileY);
    }

    moveUp() {
        this.moveTo(this.tileX, this.tileY - 1);
    }

    moveDown() {
        this.moveTo(this.tileX, this.tileY + 1);
    }

    /**
     * Moves to the tile based x-y coordinates. Ex: passing in 1,1 will move to screen location 32,32 (or whatever tile size is set).
     */
    moveTo(x: number, y: number) {
        this.setX(x * GameManager.TILE_SIZE);
        this.setY(y * GameManager.TILE_SIZE);
        this.tileX = x;
        this.tileY = y;
    }
}
