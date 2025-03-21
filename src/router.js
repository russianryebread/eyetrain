import { createWebHistory, createRouter } from "vue-router";

import MainMenu from "./MainMenu.vue";
import PhaserGame from "./game/PhaserGame.vue";

const routes = [
    { path: "/", component: MainMenu },
    { path: "/arrows", component: PhaserGame },
    { path: "/float", component: PhaserGame },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
