import { Scene } from "phaser";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        this.load.audio("correct", ["assets/sounds/correct.mp3"]);
        this.load.audio("incorrect", ["assets/sounds/incorrect.mp3"]);
    }

    create() {
        this.scene.start("Game");
    }
}
