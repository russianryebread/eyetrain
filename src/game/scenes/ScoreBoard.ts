import { ScoreObject } from "../../types/Score";
import { EventBus } from "../EventBus";

export default class ScoreBoard extends Phaser.Scene {
    resetScore: Phaser.GameObjects.Text;
    scoreBoard: Phaser.GameObjects.Text;
    score: ScoreObject = { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
    correctSound: Phaser.Sound.BaseSound;
    incorrectSound: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: "ScoreBoard", active: true });
    }

    preload() {
        this.load.audio("correct", ["assets/sounds/correct.mp3"]);
        this.load.audio("incorrect", ["assets/sounds/incorrect.mp3"]);
    }

    initScore() {
        this.resetScore = this.add.text(300, 30, "Reset Score", {
            fontSize: "30px",
            color: "#0f0",
        });
        this.resetScore.setInteractive();
        this.resetScore.on("pointerup", () => {
            window.localStorage.removeItem("score");
            window.localStorage.removeItem("timePerClickAverage");
            this.score = { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
            this.setScore(this.score);
        });

        if (window.localStorage.getItem("score")) {
            this.score = JSON.parse(window.localStorage.getItem("score") || "");
        }

        EventBus.emit("init-saved-score", this.score);

        this.setScore(this.score);
    }

    create() {
        this.correctSound = this.sound.add("correct");
        this.incorrectSound = this.sound.add("incorrect");

        const text = [
            `Score: ${this.score.score}`,
            `Total: ${this.score.total}`,
            `Red: ${this.score.red}`,
            `Blue: ${this.score.blue}`,
            `Avg: ${this.score.avg} seconds`,
        ];

        this.scoreBoard = this.add.text(10, 10, text, {
            fontFamily: "Arial",
            fontSize: 30,
            color: "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 2,
            align: "left",
        });

        this.initScore();

        EventBus.on("score-correct", (correct: boolean) => {
            if (correct) {
                this.correctSound.play();
            } else {
                this.incorrectSound.play();
            }
        });
    }

    public updateScore(correct: boolean) {
        this.score.total += 1;
        if (correct) {
            this.score.score += 1;
            this.score.blue += 1;
        } else {
            this.score.red += 1;
        }
        this.score.avg = this.calcAvg();
        window.localStorage.setItem("score", JSON.stringify(this.score));
    }

    public setScore(score: ScoreObject) {
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
                fontSize: 30,
                color: "#FFFFFF",
                stroke: "#000000",
                strokeThickness: 2,
                align: "left",
            });
        }

        window.localStorage.setItem("score", JSON.stringify(score));

        this.scoreBoard.setText(text);
    }

    private calcAvg() {
        if (this.score.total === 0) {
            return "0.0";
        }
        return (this.score.score / this.score.total).toFixed(1);
    }
}
