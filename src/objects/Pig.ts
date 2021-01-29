export interface IPig {
    scene: Phaser.Scene;
    x: number,
    y: number;
    key?: string;
    frame?: number;
}


export class Pig extends Phaser.GameObjects.Sprite  {

    private size: number = 32;

    private tileX: number = 0;
    private tileY: number = 0;

    constructor(params: IPig) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        // image
        this.setOrigin(0, 0);
        //this.setScale(0.3, 0.3);
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
        this.setX(x * this.size);
        this.setY(y * this.size);
        this.tileX = x;
        this.tileY = y;
    }
}
