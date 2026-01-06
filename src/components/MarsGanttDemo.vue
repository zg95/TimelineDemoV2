<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as mars3d from "mars3d";
import { JulianDate } from "mars3d-cesium";
import dayjs from "dayjs";
import {
  ViewportRoam,
  type GanttTask,
  type GanttGroup,
} from "chbim-time-axis-v2";

import {
  loadCountryBorder,
  removeCountryBorder,
  showDytModel,
  hideDytModel,
  waterDamSimulation,
  initResources,
  modelManager,
} from "../map";

// @ts-ignore
window.Cesium = mars3d.Cesium;

const viewerRef = ref<HTMLElement | null>(null);
// Mars3D 的 map 实例有一个 .viewer 属性指向原生 Viewer
const isViewerReady = ref(false);

const getViewer = () => {
  // @ts-ignore
  return window.viewer;
};

// 甘特图任务数据列表
const tasks = ref<(GanttTask | GanttGroup)[]>([
  {
    id: "1",
    name: "相机控制",
    type: "block",
    startTime: "",
    endTime: "",
    allowInstant: true,
    blocks: [
      {
        startTime: dayjs("2025-12-15 00:00:00").add(2, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(5, "day").toISOString(),
        name: "视口漫游1",
        color: "#ff5555",
        attr: {
          type: "viewport-roam",
          roamData: [
            {
              alt: 402.6,
              heading: 54.6,
              lat: 22.551104,
              lng: 114.144985,
              pitch: -12.2,
              time: "2025-11-30T16:00:00.000Z",
            },
            {
              alt: 334.4,
              heading: 82.5,
              lat: 22.561695,
              lng: 114.151774,
              pitch: -9.4,
              time: "2025-12-08T00:00:00.000Z",
            },
            {
              alt: 373.9,
              heading: 102.4,
              lat: 22.566208,
              lng: 114.161951,
              pitch: -11.2,
              time: "2025-12-15T08:00:00.000Z",
            },
            {
              alt: 375.1,
              heading: 93.8,
              lat: 22.559993,
              lng: 114.169893,
              pitch: -11.5,
              time: "2025-12-22T16:00:00.000Z",
            },
          ],
        },
        class: "important-block",
      },
      {
        startTime: dayjs("2025-12-15 00:00:00").add(22, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(27, "day").toISOString(),
        name: "无数据",
        color: "#5555ff",
      },
      {
        startTime: dayjs("2025-12-15 00:00:00").add(7, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(12, "day").toISOString(),
        name: "视点漫游第二段",
        color: "#e3ff55",
        attr: {
          // 视口漫游
          type: "viewport-roam",
          roamData: [
            {
              lng: 108.961601,
              lat: 34.217109,
              alt: 509.2,
              heading: 314.5,
              pitch: -22.5,
            },
            {
              lng: 108.96164,
              lat: 34.222159,
              alt: 510.3,
              heading: 211.2,
              pitch: -22.5,
            },
            {
              lng: 108.957259,
              lat: 34.221967,
              alt: 494.3,
              heading: 127.5,
              pitch: -17.2,
            },
            {
              lng: 108.957319,
              lat: 34.217225,
              alt: 515.5,
              heading: 25.4,
              pitch: -25.3,
            },
          ],
        },
      },
    ],
    instants: [
      {
        id: "1-1-1",
        time: dayjs("2025-12-16 00:00:00").toISOString(),
        attr: {
          // 视口飞行
          type: "viewport-flight",
          alt: 468.3,
          heading: 218.3,
          lat: 22.571266,
          lng: 114.168322,
          pitch: -21.4,
        },
      },
      {
        id: "1-1-2",
        time: dayjs("2025-12-16 00:00:00").add(13, "day").toISOString(),
        attr: {
          // 视口飞行
          type: "viewport-flight",
          alt: 126,
          heading: 4.9,
          lat: 29.789576,
          lng: 121.479294,
          pitch: -28.7,
        },
      },
      {
        id: "1-1-3",
        time: dayjs("2025-12-15 00:00:00").add(30, "day").toISOString(),
        name: "嘿嘿",
        attr: { verified: true },
        class: "verified-instant",
      },
    ],
  },
  {
    id: "2",
    name: "国界",
    attr: {
      type: "country-border",
    },
    startTime: dayjs("2025-12-15 00:00:00").toISOString(),
    endTime: dayjs("2025-12-15 00:00:00").add(30, "day").toISOString(),
  },
  {
    id: "3",
    name: "素材1",
    type: "group",
    startTime: "",
    endTime: "",
    children: [
      {
        id: "3-1",
        name: "大雁塔（倾斜模型）",
        attr: {
          type: "dyt-model",
        },
        startTime: dayjs("2025-12-15 00:00:00").add(6, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(13, "day").toISOString(),
      },
    ],
  },
  {
    id: "4",
    name: "水坝（模拟）",
    type: "group",
    startTime: "",
    endTime: "",
    children: [
      {
        id: "4-1",
        name: "水坝底座",
        attr: {
          type: "water-dam-model",
        },
        startTime: dayjs("2025-12-15 00:00:00").add(15, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(19, "day").toISOString(),
      },

      {
        id: "4-2",
        name: "水坝绿植",
        attr: {
          type: "water-dam-plant",
        },
        startTime: dayjs("2025-12-15 00:00:00").add(16, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(19, "day").toISOString(),
      },

      {
        id: "4-3",
        name: "房",
        attr: {
          type: "water-dam-house",
        },
        startTime: dayjs("2025-12-15 00:00:00").add(19, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(22, "day").toISOString(),
      },

      {
        id: "4-4",
        name: "水坝",
        attr: {
          type: "water-dam-model2",
        },
        startTime: dayjs("2025-12-15 00:00:00").add(23, "day").toISOString(),
        endTime: dayjs("2025-12-15 00:00:00").add(25, "day").toISOString(),
      },
    ],
  },
]);

/**
 * 添加任务处理函数
 * @param parentId - 触发添加操作的父级分组 ID
 */
const handleAdd = (parentId: string) => {
  console.log("点击了添加按钮，父级ID:", parentId);
  /**
   * 递归查找父级分组并添加新任务
   * @param list - 当前递归层级的任务列表
   */
  const addTaskToGroup = (list: (GanttTask | GanttGroup)[]) => {
    for (const item of list) {
      if (item.id === parentId) {
        if (item.type === "group") {
          const group = item as GanttGroup;
          const newId = `${group.id}-${Date.now()}`; // 生成唯一ID
          const newTask: GanttTask = {
            id: newId,
            name: `新任务 ${newId}`,
            type: "task",
            startTime: dayjs("2025-12-15 00:00:00").toISOString(),
            endTime: dayjs("2025-12-15 00:00:00").add(2, "day").toISOString(),
          };

          if (!group.children) {
            group.children = [];
          }
          group.children.push(newTask);
          return true;
        }
      }
      if (item.children && item.children.length > 0) {
        if (addTaskToGroup(item.children)) return true;
      }
    }
    return false;
  };
  addTaskToGroup(tasks.value);
};

/**
 * 处理添加瞬时任务
 * @param {GanttTask} task - 目标任务
 * @param {string | null | undefined} time - 时间
 */
const handleAddInstant = (task: GanttTask, time: string | null | undefined) => {
  if (!time) {
    console.warn("添加瞬时任务失败: 未获取到时间");
    return;
  }
  console.log("添加瞬时任务", task.name, time);

  const addInstant = (list: (GanttTask | GanttGroup)[]): boolean => {
    for (const t of list) {
      if (t.id === task.id) {
        if (!t.instants) {
          t.instants = [];
        }
        t.instants.push({
          id: `${t.id}-inst-${Date.now()}`,
          time: time,
          name: "新瞬时点",
          color: "#ffffff",
        });
        return true;
      }
      if (t.children) {
        if (addInstant(t.children)) return true;
      }
    }
    return false;
  };

  addInstant(tasks.value);
};

/**
 * 删除瞬时点处理函数
 * @param task - 包含瞬时点的目标任务对象
 * @param instant - 需要删除的瞬时点对象
 */
const handleDeleteInstant = (task: GanttTask, instant: any) => {
  /**
   * 递归查找任务并更新瞬时点列表
   * @param list - 当前递归层级的任务列表
   */
  const updateTask = (list: GanttTask[]) => {
    for (const t of list) {
      if (t.id === task.id) {
        if (t.instants) {
          const idx = t.instants.findIndex((i) => i.id === instant.id);
          if (idx !== -1) t.instants.splice(idx, 1);
        }
        return true;
      }
      if (t.children) {
        if (updateTask(t.children)) return true;
      }
    }
    return false;
  };
  updateTask(tasks.value);
};

/**
 * 删除任务处理函数
 * @param id - 需要删除的任务或分组的 ID
 */
const handleDelete = (id: string) => {
  console.log("点击了删除按钮，ID:", id);

  /**
   * 递归查找并删除任务或分组
   * @param list - 当前递归层级的任务列表
   */
  const deleteTask = (list: (GanttTask | GanttGroup)[]): boolean => {
    const index = list.findIndex((t) => t.id === id);
    if (index !== -1) {
      list.splice(index, 1);
      return true;
    }

    for (const item of list) {
      if (item.children && item.children.length > 0) {
        if (deleteTask(item.children)) return true;
      }
    }
    return false;
  };

  deleteTask(tasks.value);
};

/**
 * 编辑任务处理函数
 * @param item - 需要编辑的任务对象
 */
const handleEdit = (item: GanttTask) => {
  const newName = prompt("请输入新的名称:", item.name);
  if (newName && newName.trim() !== "") {
    updateTaskNameRecursively(tasks.value, item.id, newName);
  }
};

/**
 * 时间轴播放进入任务范围时的回调
 * @param items - 进入时间范围的任务集合，包含任务对象及可能的块/瞬时点信息
 */
const handleTaskEnter = (
  items: { task: GanttTask; block?: any; instant?: any }[]
) => {
  // console.log("******************************进入任务范围:", items);

  // 防止页面加载初始化时自动触发：只有在时间轴播放状态下才执行飞行
  let duration = 1;
  if (window.map && !window.map.clock.shouldAnimate) {
    duration = 0.2;
    // return;
  }
  // 如果是瞬时点 同时 attr的type为"viewport-flight" 那么就获取alt heading lat lng pitch 执行一次视口飞行 飞行期间 时间停止 飞行完成后 时间继续
  items.forEach((item) => {
    const { instant, task } = item;
    // 视点飞行
    if (instant && instant.attr?.type === "viewport-flight") {
      const { alt, heading, lat, lng, pitch } = instant.attr;
      console.log("?????????????");
      if (window.map) {
        // 停止时间
        if (duration > 0.5) {
          window.map.clock.shouldAnimate = false;
        }
        window.map
          .setCameraView(
            {
              lat,
              lng,
              alt,
              heading,
              pitch,
            },
            {
              duration,
            }
          )
          .then(() => {
            if (duration > 0.5) {
              window.map.clock.shouldAnimate = true;
            }
          });
      }
    }
    if (task) {
      if (task.attr) {
        let { type } = task.attr as any;
        switch (type) {
          case "country-border":
            // 国家边界
            loadCountryBorder();
            break;
          case "dyt-model":
            // 大雁塔模型
            showDytModel();
            break;
        }
      }
    }
  });
};

/**
 * 时间轴播放离开任务范围时的回调
 * @param items - 离开时间范围的任务集合
 */
const handleTaskLeave = (
  items: { task: GanttTask; block?: any; instant?: any }[]
) => {
  items.forEach((item) => {
    const { task, block } = item;
    if (task) {
      if (task.attr) {
        let { type } = task.attr as any;
        switch (type) {
          case "country-border":
            // 国家边界
            removeCountryBorder();
            break;
          case "dyt-model":
            // 大雁塔模型
            hideDytModel();
            break;
        }
      }
    }
  });
};

/**
 * 递归更新任务名称辅助函数
 * @param list - 遍历的任务列表
 * @param id - 目标任务 ID
 * @param name - 新的任务名称
 */
const updateTaskNameRecursively = (
  list: (GanttTask | GanttGroup)[],
  id: string,
  name: string
): boolean => {
  for (const task of list) {
    if (task.id === id) {
      task.name = name;
      return true;
    }
    if (task.children) {
      if (updateTaskNameRecursively(task.children, id, name)) return true;
    }
  }
  return false;
};

/**
 * 更新任务处理函数
 * @param task - 更新后的任务对象
 */
const handleUpdateTask = (task: GanttTask) => {
  // console.log("******************************更新任务:", task);
  // 当任务更新（如拖拽、缩放）时，重新计算漫游数据并更新播放器
  updateRoamPlayer();
  updateModelManager();
};

/**
 * 更新任务列表处理函数
 * @param tasks - 更新后的任务列表
 */
const handleUpdateTasks = (tasks: (GanttTask | GanttGroup)[]) => {
  // console.log("******************************更新任务列表:", tasks);
  // 当任务列表结构变化时，也重新更新播放器
  updateRoamPlayer();
  updateModelManager();
};

/**
 * 更新模型管理器状态
 * 遍历所有任务，将相关模型任务重新注册到管理器中
 */
const updateModelManager = () => {
  if (modelManager && tasks.value) {
    // 1. 清除旧任务
    modelManager.clearTasks();

    // 2. 递归查找并注册任务
    const traverse = (list: (GanttTask | GanttGroup)[]) => {
      list.forEach((item) => {
        if (item.type === "group" && item.children) {
          traverse(item.children);
        } else {
          const task = item as GanttTask;
          if (task.attr && task.attr.type === "water-dam-model") {
            waterDamSimulation(task, 1);
          }
          if (task.attr && task.attr.type === "water-dam-plant") {
            waterDamSimulation(task, 2);
          }
          if (task.attr && task.attr.type === "water-dam-house") {
            waterDamSimulation(task, 3);
          }
          if (task.attr && task.attr.type === "water-dam-model2") {
            waterDamSimulation(task, 4);
          }
        }
      });
    };
    traverse(tasks.value);

    // 3. 立即刷新当前时间状态
    if (window.map && window.map.clock) {
      const currentTime = JulianDate.toDate(window.map.clock.currentTime);
      modelManager.updateTime(currentTime.getTime());
    }
  }
};

/**
 * 更新块处理函数
 * @param block - 更新后的块对象
 */
const handleBlockUpdate = (payload: {
  task: GanttTask;
  block: any;
  index: number;
}) => {
  console.log("******************************更新块:", payload);
  updateRoamPlayer();
  updateModelManager();
};

/**
 * 重新计算漫游数据并更新播放器
 */
const updateRoamPlayer = () => {
  if (!window.viewer) return;

  // 1. 如果没有播放器，初始化一个
  if (!roamPlayer.value) {
    // @ts-ignore
    roamPlayer.value = new ViewportRoam(window.map.viewer);
  }

  // 2. 重置 roamData 中的 time
  resetRoamDataTimes(tasks.value);

  // console.log("******************************更新漫游数据:", tasks);
  roamPlayer.value.updateData(tasks.value as any);

  // 4. 如果之前是播放状态，确保继续播放
  if (isRoaming.value) {
    roamPlayer.value.start();
  }
};

/**
 * 重置漫游数据时间（辅助函数）
 * 用于在任务时间改变后，清除漫游点已计算的绝对时间，以便重新插值
 */
const resetRoamDataTimes = (list: (GanttTask | GanttGroup)[]) => {
  list.forEach((item) => {
    if (item.type === "group" && item.children) {
      resetRoamDataTimes(item.children);
    } else {
      const task = item as GanttTask;

      if (task.attr?.roamData) {
        task.attr.roamData.forEach((p: any) => delete p.time);
      }
      if (task.blocks) {
        task.blocks.forEach((block) => {
          if (block.attr?.roamData) {
            block.attr.roamData.forEach((p: any) => delete p.time);
          }
        });
      }
    }
  });
};

onMounted(() => {
  // if (window.map == null) {
  if (viewerRef.value) {
    //     // 初始化 Mars3D Map 时间默认停止 同时把开始时间设置到 2025年12月15日
    window.map = new mars3d.Map("mars3d-container", {
      scene: {
        center: {
          lat: 30.054604,
          lng: 108.885436,
          alt: 17036414,
          heading: 0,
          pitch: -90,
        },
        clock: {
          currentTime: "2025-12-14 20:00:00",
          shouldAnimate: false,
        },
        globe: {
          depthTestAgainstTerrain: true,
        },
      },
      control: {
        baseLayerPicker: false,
        timeline: true,
        animation: true,
        infoBox: false,
        selectionIndicator: false,
      },
      terrain: {
        url: "http://data.mars3d.cn/terrain",
        show: true,
      },
      basemaps: [
        {
          name: "天地图影像",
          icon: "https://data.mars3d.cn/img/thumbnail/basemap/tdt_img.png",
          type: "tdt",
          layer: "img_d",
          show: true,
        },
      ],
    });
    window.mars3d = mars3d;
    // 监听时间轴更新，驱动水坝模型动画
    window.map.on(mars3d.EventType.clockTick, () => {
      if (window.map && window.map.clock) {
        const currentTime = JulianDate.toDate(window.map.clock.currentTime);
        modelManager.updateTime(currentTime.getTime());
      }
    });
    // 获取内部 Cesium Viewer 实例供甘特图组件使用
    // @ts-ignore
    window.viewer = window.map.viewer;
    window.map.fixedLight = true;
    // 更新时间播放倍率
    window.map.clock.multiplier = 30000;
    // 配置 Cesium 动画/时间轴以显示本地时间 (例如中国时间)
    // @ts-ignore
    if (window.viewer.animation) {
      // @ts-ignore
      const viewModel = window.viewer.animation.viewModel;
      /**
       * 日期格式化函数
       * @param date - Cesium 的 JulianDate 时间对象
       * @param viewModel - 视图模型对象
       */
      viewModel.dateFormatter = (date: JulianDate, _viewModel: any) => {
        const jsDate = JulianDate.toDate(date);
        return dayjs(jsDate).format("YYYY-MM-DD");
      };
      /**
       * 时间格式化函数
       * @param date - Cesium 的 JulianDate 时间对象
       * @param viewModel - 视图模型对象
       */
      viewModel.timeFormatter = (date: JulianDate, _viewModel: any) => {
        const jsDate = JulianDate.toDate(date);
        return dayjs(jsDate).format("HH:mm:ss");
      };
    }
  }
  nextTick(() => {
      // 初始化漫游播放器
      updateRoamPlayer();
      if (roamPlayer.value) {
        // 默认开启漫游
        roamPlayer.value.start();
        initResources();
      }
      // 初始化模型管理器，确保初始任务状态被加载
      updateModelManager();

      isViewerReady.value = true;

  });
});

onUnmounted(() => {
  if (window.map) {
    window.map.destroy();
    window.map = null;
    // @ts-ignore
    window.viewer = undefined;
  }
  // cleanUpResources();
});

const isRoaming = ref(false);
const roamPlayer = ref<ViewportRoam | null>(null);
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <!-- Mars3D/Cesium 地球容器 -->
    <div
      style="flex: 1; position: relative; overflow: hidden"
      ref="viewerRef"
      id="mars3d-container"
    ></div>
    <!-- 甘特图组件区域 -->
    <div>
      <CesiumGantt
        v-if="isViewerReady"
        :viewer="getViewer()"
        v-model:tasks="tasks"
        @add="handleAdd"
        @delete="handleDelete"
        @task-enter="handleTaskEnter"
        @task-leave="handleTaskLeave"
        @update:tasks="handleUpdateTasks"
        @taskUpdate="handleUpdateTask"
        @blockUpdate="handleBlockUpdate"
      >
        <!--  自定义工具栏插槽 -->
        <template #toolbar="{ togglePlay, isPlaying, handleResetView }">
          <div
            style="
              background: rgb(145 61 61);
              background: #333;
              display: flex;
              gap: 10px;
              align-items: center;
              color: white;
              height: 100%;
              width: 100%;
              background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
              color: #fff;
              box-shadow: 0 10px 30px rgba(45, 62, 80, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1);
              border-radius: 12px;
              padding: 0 10px;
            "
          >
            <span>自定义工具栏:</span>
            <button @click="togglePlay">
              {{ isPlaying ? "暂停" : "播放" }}
            </button>
            <button @click="handleResetView">重置</button>
          </div>
        </template>

        <!-- 任务操作列自定义插槽 -->
        <template #taskOp="{ item }">
          <div style="display: flex; gap: 5px">
            <span
              v-if="item.type === 'group'"
              @click="handleAdd(item.id)"
              style="cursor: pointer"
            >
              +
            </span>
            <span @click="handleDelete(item.id)" style="cursor: pointer">
              🗑
            </span>
            <span
              @click="handleEdit(item)"
              style="cursor: pointer; border: none"
            >
              编辑
            </span>
          </div>
        </template>

        <template #barContent="{ bar }">
          <span v-if="bar.width > 50" class="barLabel">
            {{ bar.name }}
          </span>
        </template>

        <template #blockContent="{ block }">
          <span v-if="block.width > 50" class="barLabel">
            {{ block.name }} / 自定义
          </span>
        </template>

        <template #instantContent="{ instant }">
          <span class="instantLabel">{{ instant.name }}</span>
        </template>

        <!-- 右侧时间轴任务块/行右键菜单插槽 -->
        <template #barContextMenu="{ task, block, instant, close, time }">
          <template v-if="task">
            <!-- 任务/Block 多项 -->
            <template v-if="!instant">
              <div
                style="
                  padding: 8px;
                  border-bottom: 1px solid #555;
                  color: #aaa;
                  font-size: 12px;
                "
              >
                {{ block ? `块: ${block.name}` : `任务: ${task.name}` }}
                <div
                  v-if="block?.attr || task.attr"
                  style="color: #888; margin-top: 4px"
                >
                  属性:
                  {{
                    block
                      ? JSON.stringify(block.attr)
                      : JSON.stringify(task.attr)
                  }}
                </div>
              </div>
              <!-- 添加瞬时任务 -->
              <div
                class="menu-item"
                @click="
                  handleAddInstant(task, time);
                  close();
                "
              >
                添加瞬时任务
              </div>

              <div
                class="menu-item"
                @click="
                  handleEdit(task);
                  close();
                "
              >
                编辑任务
              </div>
              <div
                class="menu-item"
                @click="
                  handleDelete(task.id);
                  close();
                "
              >
                删除任务
              </div>
            </template>

            <!-- 单项 -->
            <template v-else>
              <div
                style="
                  padding: 8px;
                  border-bottom: 1px solid #555;
                  color: #aaa;
                  font-size: 12px;
                "
              >
                {{ `瞬时点: ${instant.name || "未命名"}` }}
                <div v-if="instant.attr" style="color: #888; margin-top: 4px">
                  属性: {{ JSON.stringify(instant.attr) }}
                </div>
              </div>
              <div
                class="menu-item"
                @click="
                  handleDeleteInstant(task, instant);
                  close();
                "
              >
                删除瞬时点
              </div>
            </template>
          </template>
        </template>
      </CesiumGantt>
    </div>
  </div>
</template>

<style scoped>
.barLabel {
  font-size: 11px;
  color: #000;
  white-space: nowrap;
  padding: 0 10px;
}
.important-block {
  border: 2px solid yellow;
}
:deep(.instantTaskPoint.verified-instant) {
  border-radius: 0;
  background: transparent !important;
  box-shadow: none;
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
}
.menu-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #fff;
}
.menu-item:hover {
  background-color: #444;
}
</style>
