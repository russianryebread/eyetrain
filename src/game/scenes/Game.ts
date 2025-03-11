import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;

    arrow: Phaser.GameObjects.Text;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        const addSprite = (scene: any) => {
            // Add a new sprite to the current scene at a random position
            const x = Phaser.Math.Between(64, scene.scale.width - 64);
            const y = Phaser.Math.Between(64, scene.scale.height - 64);

            const color = Phaser.Math.Between(0, 1) ? "#4A110F" : "#0200F5";
            const rotation = Phaser.Math.Between(0, 1) ? true : false;

            if (!this.arrow) {
                this.arrow = scene.add
                    .text(x, y, "➜", {
                        fontFamily: "Arial Black",
                        fontSize: 100,
                        color: color,
                        align: "center",
                    })
                    .setOrigin(0.5)
                    .setDepth(100)
                    .setFlipY(rotation);
            }
        };

        addSprite(this);

        const changeArrow = () => {
            const x = Phaser.Math.Between(64, this.scale.width - 64);
            const y = Phaser.Math.Between(64, this.scale.height - 64);
            const color = Phaser.Math.Between(0, 1) ? "#4A110F" : "#0200F5";
            const rotation = Phaser.Math.Between(0, 1) ? true : false;

            this.arrow.setX(x).setY(y).setColor(color).setFlipX(rotation);
        };

        this.input.keyboard?.on("keyup-RIGHT", (event: any) => {
            changeArrow();
        });

        this.input.keyboard?.on("keyup-LEFT", (event: any) => {
            changeArrow();
        });

        EventBus.emit("current-scene-ready", this);
    }
}
