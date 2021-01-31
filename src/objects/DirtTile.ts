import { Tile } from "./Tile";

export interface IDirtTile {
    scene: Phaser.Scene;
    x: number, // woorld coordinates
    y: number;
    key?: string;
    frame?: number;
}

export class DirtTile extends Tile  {
    /// X and Y coordinates in matrix space
    public xCoord: number;
    public yCoord: number;

    // Keepo track of who moved out so I can adjust my tile accordingly
    private vacancies: string[];

    private removed: boolean;

    // x and y are in matrix space
    constructor(params: IDirtTile, x: number, y: number) {
        super(params.scene, params.x, params.y, "dirt");
        // image
        this.setOrigin(0.5, 0.5);
        this.xCoord = x;
        this.yCoord = y;
        this.setFrame(0);
        this.vacancies = [];
    }

    public removeTile(tiles: Array<Tile[]>) {
        this.removed = true;
        this.informSurroundingTiles(tiles);
    }

    public informSurroundingTiles(tiles: Array<Tile[]>) {
        // Get all 8 of my surrounding tiles. The keys are where I am relative to them... Confusing as hell I know.
        let neighbors = {
            s: this.getNeighbor(tiles, this.xCoord, this.yCoord - 1),
            w: this.getNeighbor(tiles, this.xCoord + 1, this.yCoord),
            n: this.getNeighbor(tiles, this.xCoord, this.yCoord + 1),
            e: this.getNeighbor(tiles, this.xCoord - 1, this.yCoord)
        };
        
        // Tell my neighbors I am leaving
        for (let key in neighbors) {
            if (neighbors[key]) {
                neighbors[key].newVanacy(key);
            }
        }
    }

    public newVanacy(position: string) {
        this.vacancies.push(position);

        if (this.vacancies.indexOf('s') !== -1 && this.vacancies.indexOf('e') !== -1 && this.vacancies.indexOf('n') !== -1 && this.vacancies.indexOf('w') !== -1) {
            this.setFrame(9);
        } else if (this.vacancies.indexOf('e') !== -1 && this.vacancies.indexOf('n') !== -1 && this.vacancies.indexOf('w') !== -1) {
            this.setFrame(5);
        } else if (this.vacancies.indexOf('n') !== -1 && this.vacancies.indexOf('e') !== -1 && this.vacancies.indexOf('s') !== -1) {
            this.setFrame(6);
        } else if (this.vacancies.indexOf('e') !== -1 && this.vacancies.indexOf('s') !== -1 && this.vacancies.indexOf('w') !== -1) {
            this.setFrame(7);
        } else if (this.vacancies.indexOf('s') !== -1 && this.vacancies.indexOf('w') !== -1 && this.vacancies.indexOf('n') !== -1) {
            this.setFrame(8);
        } else if (this.vacancies.indexOf('s') !== -1 && this.vacancies.indexOf('w') !== -1) {
            this.setFrame(1);
        } else if (this.vacancies.indexOf('n') !== -1 && this.vacancies.indexOf('w') !== -1) {
            this.setFrame(2);
        } else if (this.vacancies.indexOf('n') !== -1 && this.vacancies.indexOf('e') !== -1) {
            this.setFrame(3);
        } else if (this.vacancies.indexOf('s') !== -1 && this.vacancies.indexOf('e') !== -1) {
            this.setFrame(4);
        }
    }

    private getNeighbor(tiles: Array<Tile[]>, column: number, row: number): Tile {
        try {
            return tiles[row][column];
        } catch (error) {
            return null;
        }
    }
}
