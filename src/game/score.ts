import { ScoreObject } from "../types/Score";

class Score {
    private score: ScoreObject = {
        score: 0,
        total: 0,
        red: 0,
        blue: 0,
        avg: "0.0",
    };
    private timeOfLastClick: number | null = null;
    private timeBetweenClicks: number = 0;
    private timePerClickAvg: Array<number> = [];

    constructor() {
        this.score = this.initScore();
    }

    private initScore() {
        const score = window.localStorage.getItem("score");
        if (score) {
            return JSON.parse(score);
        } else {
            return { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
        }
    }

    public resetScore() {
        window.localStorage.removeItem("score");
        window.localStorage.removeItem("timePerClickAverage");
        this.score = { score: 0, total: 0, red: 0, blue: 0, avg: "0.0" };
    }

    public updateScore(score: ScoreObject) {
        this.score.total += 1;
        // if (correct) {
        //     this.score.score += 1;
        //     this.score.blue += 1;
        // } else {
        //     this.score.red += 1;
        // }
        this.score.avg = this.calcAvg();
        window.localStorage.setItem("score", JSON.stringify(this.score));
    }

    private calcAvg() {
        if (this.score.total === 0) {
            return "0.0";
        }
        return (this.score.score / this.score.total).toFixed(1);
    }

    public updateTime() {
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
}

export default Score;
