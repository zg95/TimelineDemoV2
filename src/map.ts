import * as mars3d from "mars3d";
// import dayjs from "dayjs";

/**
 * 时间轴任务执行函数（map对象）
 */

// 国界线图层
let countryBorderLayer: any = null;
/**
 * 加载国家边界
 */
export const loadCountryBorder = () => {
  if (countryBorderLayer) {
    removeCountryBorder();
  }

  countryBorderLayer = new mars3d.layer.GeoJsonLayer({
    name: "国界",
    //  url,
    url: "nationalBoundaries.json",
    symbol: {
      type: "polylineC",
      styleOptions: {
        width: 2,
        materialType: "Color",
        materialOptions: {
          color: "#CD9B1D",
        },
      },
    },
  });
  window.map.addLayer(countryBorderLayer);
};

/**
 * 删除国界线
 */
export const removeCountryBorder = () => {
  if (countryBorderLayer) {
    window.map.removeLayer(countryBorderLayer, true);
    countryBorderLayer = null;
  }
};

// 大雁塔模型图层
let dytModelLayer: any = null;

/**
 * 加载大雁塔模型
 */
export const loadDytModel = () => {
  if (dytModelLayer) {
    removeDytModel();
  }
  dytModelLayer = new mars3d.layer.TilesetLayer({
    name: "大雁塔",
    url: "https://data.mars3d.cn/3dtiles/qx-dyt/tileset.json",
    position: { alt: -27 },
    maximumScreenSpaceError: 1,
    show: false,
  });
  window.map.addLayer(dytModelLayer);
};

/**
 * 显示大雁塔模型
 */
export const showDytModel = () => {
  if (dytModelLayer) {
    dytModelLayer.show = true;
  }
};

/**
 * 隐藏大雁塔模型
 */
export const hideDytModel = () => {
  if (dytModelLayer) {
    dytModelLayer.show = false;
  }
};

/**
 * 删除大雁塔模型
 */
export const removeDytModel = () => {
  if (dytModelLayer) {
    window.map.removeLayer(dytModelLayer, true);
    dytModelLayer = null;
  }
};

import { ModelManager } from "./ModelManager";

export const modelManager = new ModelManager();

// 水坝模型图层
let waterDamModelLayer: any = null;

// 加载水坝模型
export const loadWaterDamModel = () => {
  if (waterDamModelLayer) {
    removeWaterDamModel();
  }
  waterDamModelLayer = new mars3d.layer.TilesetLayer({
    name: "水坝",
    url: "https://data.mars3d.cn/3dtiles/max-fsdzm/tileset.json",
    maximumScreenSpaceError: 1,
    popup: "all",
    // show: false,
  });
  window.map.addLayer(waterDamModelLayer);

  // 初始化管理器
  modelManager.setLayer(waterDamModelLayer);
};

// 删除水坝模型
export const removeWaterDamModel = () => {
  if (waterDamModelLayer) {
    window.map.removeLayer(waterDamModelLayer, true);
    waterDamModelLayer = null;
    modelManager.setLayer(null);
  }
};

/**
 * 水坝模拟
 * 初始化：整体模型透明
 * 第一步：底座构件施工 从透明到不透明
 * 第二步：种植绿植 从地底到地面
 */
export const waterDamSimulation = (task: any, step: number) => {
  // console.log("******************************水坝模拟:", step);
  let foundationId = [];
  switch (step) {
    case 1:
      let { startTime: startTime1, endTime: endTime1 } = task;
      foundationId = [
        "72b32a1f754ba1c09b3695e0cb6cde7f",
        "9f61408e3afb633e50cdf1b20de6f466",
      ];

      // 注册施工任务到管理器
      modelManager.addConstructionTask(foundationId, startTime1, endTime1);

      // 如果需要立即刷新状态（防止时间轴没动时看不到效果）
      // modelManager.updateTime(startTime); // 可选
      break;
    case 2:
      let { startTime: startTime2, endTime: endTime2 } = task;
      foundationId = [
        "b53b3a3d6ab90ce0268229151c9bde11",
        "44f683a84163b3523afe57c2e008bc8c",
        "f457c545a9ded88f18ecee47145a72c0",
        "d82c8d1619ad8176d665453cfb2e55f0",
      ];
      // 第二步：种植绿植 从地底到地面 这些id就是绿植id
      // 假设从地下10米升到地面(0)

      modelManager.addConstructionTask(foundationId, startTime2, endTime2);

      break;
    case 3:
      let { startTime: startTime3, endTime: endTime3 } = task;
      foundationId = [
        "3295c76acbf4caaed33c36b1b5fc2cb1",
        "d09bf41544a3365a46c9077ebb5e35c3",
        "ad61ab143223efbc24c7d2583be69251",
        "fc490ca45c00b1249bbe3554a4fdf6fb",
        "ea5d2f1c4608232e07d3aa3d998e5135",
      ];
      modelManager.addConstructionTask(foundationId, startTime3, endTime3);
      break;
    case 4:
      let { startTime: startTime4, endTime: endTime4 } = task;
      foundationId = [
        "d2ddea18f00665ce8623e36bd4e3c7c5",
        "66f041e16a60928b05a7e228a89c3799",
        "072b030ba126b2f4b2374f342be9ed44",
        "32bb90e8976aab5298d5da10fe66f21d",
        "14bfa6bb14875e45bba028a21ed38046",
        "7cbbc409ec990f19c78c75bd1e06f215",
        "093f65e080a295f8076b1c5722a46aa2",
        "e2c420d928d4bf8ce0ff2ec19b371514",
      ];
      modelManager.addConstructionTask(foundationId, startTime4, endTime4);
      break;
  }
};

// 初始化资源
export const initResources = () => {
  loadDytModel();
  loadWaterDamModel();
};
