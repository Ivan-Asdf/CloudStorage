import * as Vue from "vue";

import test from "./test.vue";
import App from "./app.vue";

const app = Vue.createApp(App);
app.component("test", test);
app.mount("#app");
