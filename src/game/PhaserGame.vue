<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { EventBus } from "./EventBus";
import Phaser, { AUTO, Game } from "phaser";

const game = ref();
const props = defineProps(["scene"]);

const emit = defineEmits(["current-active-scene"]);
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
    parent: "game-container",
    backgroundColor: "#000000",
};

onMounted(() => {
    // Set scene to be loaded from router
    config.scene = props.scene;

    game.value = new Game({ ...config });
    game.value.scene.start(props.scene);

    EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        emit("current-active-scene", scene_instance);
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
    <div id="game-container"></div>
</template>
