import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { ScoreObject } from "../../types/Score";
import { BLUE, RED, ARROW_TEXT, ARROW_SIZE } from "../constants";

const SCOREBOARD_PADDING_X = 550;
const SCOREBOARD_PADDING_Y = 200;
const FAST_CLICK_RESPONSE_TIME_MS = 800;

export class ArrowGame extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    score: ScoreObject = { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
    arrow: Phaser.GameObjects.Text;
    timeBetweenClicks: number = 0;
    timeOfLastClick: number = 0;
    timePerClickAvg: Array<number> = [];

    constructor() {
        super({ key: "ArrowGame" });
    }

    updateTime() {
        const now = new Date().getTime();

        if (!this.timeOfLastClick) {
            this.timeOfLastClick = now;
            return;
        }

        this.timeBetweenClicks = now - this.timeOfLastClick;
        this.timeOfLastClick = now;

        if (!this.timePerClickAvg) {
            this.timePerClickAvg = [];
        }
        this.timePerClickAvg.push(this.timeBetweenClicks);

        window.localStorage.setItem(
            "timePerClickAverage",
            JSON.stringify(this.timePerClickAvg),
        );
    }

    genXY() {
        // Make sure we don't generate an arrow that overlaps the scoreboard
        // or is too close to the edge of the screen
        let x, y;
        const arrow_padding = ARROW_SIZE / 2;
        do {
            x = Phaser.Math.Between(
                arrow_padding,
                this.scale.width - arrow_padding,
            );
            y = Phaser.Math.Between(
                arrow_padding,
                this.scale.height - arrow_padding,
            );
        } while (
            x < SCOREBOARD_PADDING_X + arrow_padding &&
            y < SCOREBOARD_PADDING_Y + arrow_padding
        );

        return { x, y };
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.cameras.main.setRoundPixels(true);

        if (!this.arrow) {
            const { x, y } = this.genXY();
            this.arrow = this.add
                .text(x, y, ARROW_TEXT, {
                    fontSize: ARROW_SIZE,
                    color: BLUE,
                    align: "center",
                })
                .setOrigin(0.5)
                .setAngle(Phaser.Math.RND.pick([-90, 0, 90, 180]));
        }

        const changeArrow = () => {
            this.updateTime();
            const { x, y } = this.genXY();
            const color = Phaser.Math.Between(0, 1) ? RED : BLUE;

            this.arrow
                .setX(x)
                .setY(y)
                .setColor(color)
                .setAngle(Phaser.Math.RND.pick([-90, 0, 90, 180]));
        };

        this.input.keyboard?.on("keyup-UP", (event: any) => {
            this.logAction(event, this.arrow);
            changeArrow();
        });

        this.input.keyboard?.on("keyup-DOWN", (event: any) => {
            this.logAction(event, this.arrow);
            changeArrow();
        });

        this.input.keyboard?.on("keyup-RIGHT", (event: any) => {
            this.logAction(event, this.arrow);
            changeArrow();
        });

        this.input.keyboard?.on("keyup-LEFT", (event: any) => {
            this.logAction(event, this.arrow);
            changeArrow();
        });

        EventBus.on("init-saved-score", (score: ScoreObject) => {
            this.score = score;
        });

        EventBus.emit("current-scene-ready", this);
    }

    logAction(action: any, arrow: Phaser.GameObjects.Text) {
        this.score.total += 1;

        const avg =
            this.timePerClickAvg.reduce((a, b) => a + b, 0) /
            this.timePerClickAvg.length;
        const a = avg / 1000 || 0;
        this.score.avg = a.toFixed(2) || "0.0";

        const updateScore = () => {
            EventBus.emit("score-correct", true);
            if (arrow.style.color === RED) {
                this.score.red += 1;
            } else {
                this.score.blue += 1;
            }

            // 2 points for clicking within 700ms
            if (this.timeBetweenClicks < FAST_CLICK_RESPONSE_TIME_MS) {
                this.score.score += 1;
            }
            if (this.timeBetweenClicks < 1000) {
                this.score.score += 1;
            }
        };

        // arrow angle is 0 if the arrow is pointing to the right
        if (
            (action.code === "ArrowLeft" && arrow.angle === -180) ||
            (action.code === "ArrowRight" && arrow.angle === 0) ||
            (action.code === "ArrowUp" && arrow.angle === -90) ||
            (action.code === "ArrowDown" && arrow.angle === 90)
        ) {
            updateScore();
        } else {
            EventBus.emit("score-correct", false);
            // Try to discourage spam clicking
            if (this.timeBetweenClicks < 300) {
                this.score.score -= 2;
            } else {
                this.score.score -= 1;
            }
        }

        this.setScore(this.score);
    }

    setScore(score: ScoreObject) {
        EventBus.emit("update-score", score);
    }
}
