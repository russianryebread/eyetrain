import { createWebHistory, createRouter } from "vue-router";

import MainMenu from "./MainMenu.vue";
import PhaserGame from "./game/PhaserGame.vue";

const routes = [
    { path: "/", component: MainMenu },
    { path: "/arrows", component: PhaserGame, props: { scene: "ArrowGame" } },
    {
        path: "/float",
        component: PhaserGame,
        props: { scene: "FloatingArrowGame" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
