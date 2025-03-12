import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { ScoreObject } from "../../types/Score";

const RED = "#FF0000";
const BLUE = "#0000FF";

export class ArrowGame extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    score: ScoreObject = { score: 0, total: 0, red: 0, blue: 0 };
    scoreBoard: Phaser.GameObjects.Text;
    resetScore: Phaser.GameObjects.Text;
    arrow: Phaser.GameObjects.Text;
    red: string = RED; //"#440000";
    blue: string = BLUE;
    timeBetweenClicks: number = 0;
    timeOfLastClick: number = 0;
    timePerClickAvg: Array<number> = [];
    correctSound: Phaser.Sound.BaseSound;
    incorrectSound: Phaser.Sound.BaseSound;

    constructor() {
        super("Game");
    }

    initialize() {
        this.correctSound = this.sound.add("correct");
        this.incorrectSound = this.sound.add("incorrect");

        if (window.localStorage.getItem("score")) {
            this.score = JSON.parse(window.localStorage.getItem("score") || "");
        }

        this.setScore(this.score);

        const x = Phaser.Math.Between(64, this.scale.width - 64);
        const y = Phaser.Math.Between(64, this.scale.height - 64);

        if (!this.arrow) {
            this.arrow = this.add
                .text(x, y, "➜", {
                    fontFamily: "Arial Black",
                    fontSize: 100,
                    color: BLUE,
                    align: "center",
                })
                .setOrigin(0.5)
                .setDepth(100)
                .setAngle(Phaser.Math.RND.pick([-90, 0, 90, 180]));
        }
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

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        // Reset score button
        this.resetScore = this.add.text(150, 10, "Reset Score", {
            color: "#0f0",
        });
        this.resetScore.setInteractive();
        this.resetScore.on("pointerup", () => {
            window.localStorage.removeItem("score");
            window.localStorage.removeItem("timePerClickAverage");
            this.score = { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
            this.setScore(this.score);
        });

        this.initialize();

        const changeArrow = () => {
            this.updateTime();

            const x = Phaser.Math.Between(64, this.scale.width - 64);
            const y = Phaser.Math.Between(64, this.scale.height - 64);
            const color = Phaser.Math.Between(0, 1) ? this.red : this.blue;

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
            this.correctSound.play();
            if (arrow.style.color === this.red) {
                this.score.red += 1;
            } else {
                this.score.blue += 1;
            }

            // 2 points for clicking within 500ms
            if (this.timeBetweenClicks < 500) {
                this.score.score += 1;
            }
            if (this.timeBetweenClicks < 1000) {
                this.score.score += 1;
            }
        };

        // arrow adgle is 0 if the arrow is pointing to the right
        if (action.code === "ArrowLeft" && arrow.angle === -180) {
            updateScore();
        } else if (action.code === "ArrowRight" && arrow.angle === 0) {
            updateScore();
        } else if (action.code === "ArrowUp" && arrow.angle === -90) {
            updateScore();
        } else if (action.code === "ArrowDown" && arrow.angle === 90) {
            updateScore();
        } else {
            this.incorrectSound.play();
            if (this.timeBetweenClicks < 500) {
                this.score.score -= 2;
            } else {
                this.score.score -= 1;
            }
        }

        this.setScore(this.score);
    }

    setScore(score: ScoreObject) {
        const text = [
            `Score: ${score.score}`,
            `Total: ${score.total}`,
            `Red: ${score.red}`,
            `Blue: ${score.blue}`,
            `Avg: ${score.avg} seconds`,
        ];

        if (!this.scoreBoard) {
            this.scoreBoard = this.add.text(10, 10, text, {
                fontFamily: "Arial",
                fontSize: 15,
                color: "#FFFFFF",
                stroke: "#000000",
                strokeThickness: 2,
                align: "left",
            });
        }

        window.localStorage.setItem("score", JSON.stringify(score));

        this.scoreBoard.setText(text);
    }
}
