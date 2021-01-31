export class Tile extends Phaser.GameObjects.Image {

    private isDrawn: boolean;

    public draw(parent: Phaser.GameObjects.Container) {
        if (this.isDrawn) {
            // return;
        }
        parent.add(this);
        this.isDrawn = true;
    }

}
