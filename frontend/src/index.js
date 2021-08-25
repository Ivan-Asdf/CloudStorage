import * as Vue from "vue";

import App from "./app.vue";
import Progress from "./components/progress.vue";

const app = Vue.createApp(App);
app.component("Progress", Progress);
app.mount("#app");
