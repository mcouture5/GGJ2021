export class CameraManager implements Manager {

    private camera: Phaser.Cameras.Scene2D.Camera;

    constructor(camera: Phaser.Cameras.Scene2D.Camera) {
        this.camera = camera;
    }

    create() {}
    update() {}
}
