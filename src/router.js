import { createWebHistory, createRouter } from "vue-router";

import MainMenu from "./MainMenu.vue";
import EyeTrain from "./game/EyeTrain.vue";

import { ArrowGame } from "./game/scenes/ArrowGame";
import { FloatingArrowGame } from "./game/scenes/FloatingArrowGame";

const routes = [
    { path: "/", component: MainMenu },
    { path: "/arrows", component: EyeTrain, props: { scene: ArrowGame } },
    {
        path: "/float",
        component: EyeTrain,
        props: { scene: FloatingArrowGame },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
