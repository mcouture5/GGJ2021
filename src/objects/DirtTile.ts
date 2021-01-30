export interface IDirtTile {
    scene: Phaser.Scene;
    x: number,
    y: number;
    key?: string;
    frame?: number;
}


export class DirtTile extends Phaser.GameObjects.Sprite  {

    constructor(params: IDirtTile) {
        super(params.scene, params.x, params.y, params.key, params.frame);
        // image
        this.setOrigin(0, 0);
    }

    update(): void {
    }
}
