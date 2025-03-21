import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { RED, BLUE, ARROW_TEXT, ARROW_SIZE } from "../constants";

const SPEED = 150;

export class FloatingArrowGame extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    correctSound: Phaser.Sound.BaseSound;
    incorrectSound: Phaser.Sound.BaseSound;
    arrowText: Phaser.GameObjects.Text;
    changeDirectionTimer: Phaser.Time.TimerEvent;
    angle = 0;

    constructor() {
        super({ key: "FloatingArrowGame" });
    }

    preload() {
        this.load.audio("correct", ["assets/sounds/correct.mp3"]);
        this.load.audio("incorrect", ["assets/sounds/incorrect.mp3"]);
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.cameras.main.setRoundPixels(true);
        this.correctSound = this.sound.add("correct");
        this.incorrectSound = this.sound.add("incorrect");

        const arrow_padding = ARROW_SIZE / 2;
        this.arrowText = this.add.text(
            Phaser.Math.Between(
                arrow_padding,
                this.scale.width - arrow_padding,
            ),
            Phaser.Math.Between(
                arrow_padding,
                this.scale.height - arrow_padding,
            ),
            ARROW_TEXT,
            {
                fontSize: ARROW_SIZE,
                color: BLUE,
            },
        );

        this.physics.world.enable(this.arrowText);
        this.arrowText.body.setCollideWorldBounds(true);
        this.arrowText.body.setBounce(1);

        this.arrowText.setOrigin(0.5);
        this.setRandomDirection(this.arrowText);

        // Change direction of movement (between 4-8 seconds)
        this.time.addEvent({
            delay: Phaser.Math.Between(4000, 8000),
            callback: () => this.setRandomDirection(this.arrowText),
            callbackScope: this,
            loop: true,
        });

        // hange direction of arrow (between 2-5 seconds)
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: () => this.setRandomAngle(this.arrowText),
            callbackScope: this,
            loop: true,
        });

        EventBus.emit("current-scene-ready", this);
    }

    update() {}

    setRandomAngle(textObj: Phaser.GameObjects.Text) {
        textObj.setAngle(Phaser.Math.RND.pick([-90, 0, 90, 180]));
        textObj.setColor(Phaser.Math.RND.pick([RED, BLUE]));
    }

    setRandomDirection(textObj: Phaser.GameObjects.Text) {
        try {
            // Generate a random angle in radians
            this.angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

            // Convert angle to velocity
            const vx = Math.cos(this.angle) * SPEED;
            const vy = Math.sin(this.angle) * SPEED;

            // Set the velocity
            if (textObj.body) {
                textObj.body.setVelocity(vx, vy);
            }
        } catch (error) {
            console.error("Error setting direction:", error);
        }
    }
}
