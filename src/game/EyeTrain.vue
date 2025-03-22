<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { EventBus } from "./EventBus";
import { ScoreObject } from "../types/Score";
import Phaser, { AUTO, Game } from "phaser";
import Score from "./score";
import ScoreBoard from "./scenes/ScoreBoard";

const game = ref();
const props = defineProps(["scene"]);

const emit = defineEmits(["current-active-scene", "update-score"]);
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.NONE,
        width: window.innerWidth * window.devicePixelRatio,
        height: window.innerHeight * window.devicePixelRatio,
        zoom: 1 / window.devicePixelRatio,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    parent: "eyetrain",
    backgroundColor: "#000000",
};

onMounted(() => {
    // Set scene to be loaded from router
    // config.scene = [props.scene, ScoreBoard];
    config.scene = props.scene;
    game.value = new Game({ ...config });

    EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        emit("current-active-scene", scene_instance);
    });

    EventBus.on("update-score", (score: ScoreObject) => {
        emit("update-score", score);
        const s = new Score();
        s.updateScore(score);
    });
});

onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }
});

defineExpose({ game });
</script>

<template>
    <div id="eyetrain"></div>
</template>
