export interface IDirtTile {
    scene: Phaser.Scene;
    x: number, // woorld coordinates
    y: number;
    key?: string;
    frame?: number;
}


export class DirtTile extends Phaser.GameObjects.Sprite  {

    /// X and Y coordinates in matrix space
    public xCoord: number;
    public yCoord: number;

    // x and y are in matrix space
    constructor(params: IDirtTile, x: number, y: number) {
        super(params.scene, params.x, params.y, params.key);
        // image
        this.setOrigin(0, 0);
        this.xCoord = x;
        this.yCoord = y;
    }

    update(): void {
    }

    public checkSurroundingTiles(tiles: Array<DirtTile[]>) {
        // Get all 8 of my surrounding tiles
        let neighbors = {
            nw: this.getNeighbor(tiles, this.xCoord - 1, this.yCoord - 1),
            n: this.getNeighbor(tiles, this.xCoord, this.yCoord - 1),
            ne: this.getNeighbor(tiles, this.xCoord + 1, this.yCoord - 1),
            e: this.getNeighbor(tiles, this.xCoord + 1, this.yCoord),
            se: this.getNeighbor(tiles, this.xCoord + 1, this.yCoord + 1),
            s: this.getNeighbor(tiles, this.xCoord, this.yCoord + 1),
            sw: this.getNeighbor(tiles, this.xCoord - 1, this.yCoord + 1),
            w: this.getNeighbor(tiles, this.xCoord - 1, this.yCoord)
        };
        // console.log(neighbors);
    }

    private getNeighbor(tiles: Array<DirtTile[]>, column: number, row: number): DirtTile {
        try {
            return tiles[row][column];
        } catch (error) {
            return null;
        }
    }

}
