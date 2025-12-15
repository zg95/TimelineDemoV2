// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import CesiumGantt from "chbim-time-axis-v2";
import "chbim-time-axis-v2/style.css"; // 别忘了引入样式
import "mars3d-cesium/Build/Cesium/Widgets/widgets.css";
import "mars3d//mars3d.css";

const app = createApp(App);
app.use(CesiumGantt); // 注册组件
app.mount("#app");
