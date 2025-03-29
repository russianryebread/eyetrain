import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { ScoreObject } from "../../types/Score";
import { RED, BLUE, ARROW_TEXT, ARROW_SIZE } from "../constants";

const SPEED = 200;

export class FloatingArrowGame extends Scene {
    score: ScoreObject = { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
    camera: Phaser.Cameras.Scene2D.Camera;
    arrowText: Phaser.GameObjects.Text;
    changeDirectionTimer: Phaser.Time.TimerEvent;
    loggedScoreForTurn: boolean = false;
    angle = 0;

    constructor() {
        super({ key: "FloatingArrowGame" });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.cameras.main.setRoundPixels(true);

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
        const arrowBody = this.arrowText.body as Phaser.Physics.Arcade.Body;
        if (arrowBody) {
            arrowBody.setCollideWorldBounds(true);
            arrowBody.setBounce(1);
        }

        this.arrowText.setOrigin(0.5);
        this.setRandomDirection(this.arrowText);

        // Change direction of arrow (between 1-5 seconds)
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 5000),
            callback: () => this.setRandomAngle(this.arrowText),
            callbackScope: this,
            loop: true,
        });

        this.input.keyboard?.on("keyup-UP", (event: any) => {
            this.logAction(event, this.arrowText);
        });

        this.input.keyboard?.on("keyup-DOWN", (event: any) => {
            this.logAction(event, this.arrowText);
        });

        this.input.keyboard?.on("keyup-RIGHT", (event: any) => {
            this.logAction(event, this.arrowText);
        });

        this.input.keyboard?.on("keyup-LEFT", (event: any) => {
            this.logAction(event, this.arrowText);
        });

        EventBus.on("init-saved-score", (score: ScoreObject) => {
            this.score = score;
        });

        EventBus.emit("current-scene-ready", this);
    }

    logAction(action: any, arrow: Phaser.GameObjects.Text) {
        // Prevent score from being logged multiple times for the same turn
        if (this.loggedScoreForTurn) return;
        this.loggedScoreForTurn = true;

        this.score.total += 1;

        // arrow angle is 0 if the arrow is pointing to the right
        if (
            (action.code === "ArrowLeft" && arrow.angle === -180) ||
            (action.code === "ArrowRight" && arrow.angle === 0) ||
            (action.code === "ArrowUp" && arrow.angle === -90) ||
            (action.code === "ArrowDown" && arrow.angle === 90)
        ) {
            EventBus.emit("score-correct", true);
            this.score.score += 1;

            if (arrow.style.color === BLUE) {
                this.score.blue += 1;
            } else {
                this.score.red += 1;
            }
        } else {
            EventBus.emit("score-correct", false);
            this.score.score -= 1;
        }

        EventBus.emit("update-score", this.score);
    }

    setRandomAngle(textObj: Phaser.GameObjects.Text) {
        this.loggedScoreForTurn = false;

        // Don't allow the arrow to have the same angle as before
        let newAngle;
        do {
            newAngle = Phaser.Math.RND.pick([-90, 0, 90, 180]);
        } while (newAngle === textObj.angle);

        textObj.setAngle(newAngle);
        textObj.setColor(Phaser.Math.RND.pick([RED, BLUE]));
    }

    // Function to check if the angle is in (or close to) a straight direction
    isStraightDirection(angle: number) {
        const threshold = Math.PI / 8; // 22.5 degrees
        return (
            angle < threshold || // Right
            angle > Math.PI * 2 - threshold || // Left
            (angle > Math.PI / 2 - threshold &&
                angle < Math.PI / 2 + threshold) || // Up
            (angle > (3 * Math.PI) / 2 - threshold &&
                angle < (3 * Math.PI) / 2 + threshold) // Down
        );
    }

    setRandomDirection(textObj: Phaser.GameObjects.Text) {
        try {
            do {
                this.angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            } while (this.isStraightDirection(this.angle));

            // Convert angle to velocity
            const vx = Math.cos(this.angle) * SPEED;
            const vy = Math.sin(this.angle) * SPEED;

            // Set the velocity
            if (textObj.body) {
                let body = textObj.body as Phaser.Physics.Arcade.Body;
                body.setVelocity(vx, vy);
            }
        } catch (error) {
            console.error("Error setting direction:", error);
        }
    }
}
