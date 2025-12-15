<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as mars3d from "mars3d";
import { JulianDate } from "mars3d-cesium";
import dayjs from "dayjs";
import type { GanttTask, GanttGroup } from "chbim-time-axis-v2";

// 将 Cesium 挂载到全局 window 对象 (Mars3D 内部也依赖 Cesium)
// @ts-ignore
window.Cesium = mars3d.Cesium;

const viewerRef = ref<HTMLElement | null>(null);
// 注意：CesiumGantt 可能需要原生 Cesium.Viewer 对象，
// Mars3D 的 map 实例有一个 .viewer 属性指向原生 Viewer
const mapInstance = ref<mars3d.Map | null>(null);
const isViewerReady = ref(false);

const getViewer = () => {
  // @ts-ignore
  return window.viewer;
};

// 甘特图任务数据列表
const tasks = ref<(GanttTask | GanttGroup)[]>([
  {
    id: "1",
    name: "分组 1",
    type: "group",
    // 分组的时间会自动计算，无需手动指定
    startTime: "",
    endTime: "",
    // 设置时间限制以测试警告功能
    limitStartTime: dayjs().subtract(1, "day").toISOString(), // 限制开始时间：昨天
    limitEndTime: dayjs().add(6, "day").toISOString(), // 限制结束时间：6天后
    children: [
      {
        id: "1-1",
        name: "任务 1",
        startTime: dayjs().subtract(2, "day").toISOString(), // 超出限制（早于限制开始时间）
        endTime: dayjs().add(2, "day").toISOString(),
      },
      {
        id: "1-2",
        name: "任务 2",
        startTime: dayjs().add(1, "day").toISOString(),
        endTime: dayjs().add(3, "day").toISOString(),
      },
      {
        id: "1-3",
        name: "任务 3",
        startTime: dayjs().add(2, "day").toISOString(),
        endTime: dayjs().add(7, "day").toISOString(), // 超出限制（晚于限制结束时间）
      },
    ],
  },
  {
    id: "6-0",
    name: "任务 6",
    startTime: dayjs().add(6, "day").toISOString(),
    endTime: dayjs().add(8, "day").toISOString(),
    type: "task",
    allowInstant: true, // 仅该任务允许添加瞬时点
    instants: [
      {
        id: "6-0-1",
        time: dayjs().add(7, "day").toISOString(),
        name: "检查点",
      },
    ],
  },

  {
    id: "7",
    name: "多块任务示例",
    type: "block", // 块类型任务
    startTime: "",
    endTime: "",
    allowInstant: true,
    blocks: [
      {
        startTime: dayjs().add(12, "day").toISOString(),
        endTime: dayjs().add(14, "day").toISOString(),
        name: "阶段 1",
        color: "#ff5555",
      },
      {
        startTime: dayjs().add(16, "day").toISOString(),
        endTime: dayjs().add(19, "day").toISOString(),
        name: "阶段 2",
        color: "#5555ff",
      },
      {
        startTime: dayjs().add(1, "day").toISOString(),
        endTime: dayjs().add(13, "day").toISOString(),
        name: "阶段 3",
        color: "#e3ff55",
      },
    ],
  },
  {
    id: "8",
    name: "瞬时任务示例 (右键添加)",
    type: "instant",
    startTime: "",
    endTime: "",
    instants: [
      {
        id: "8-1",
        time: dayjs().add(5, "day").toISOString(),
        name: "里程碑 1",
        color: "#ffffff",
      },
      {
        id: "8-2",
        time: dayjs().add(10, "day").toISOString(),
        name: "里程碑 2",
        color: "#ffffff",
      },
    ],
  },
  {
    id: "2",
    name: "分组 2",
    type: "group",
    startTime: "",
    endTime: "",
    children: [
      {
        id: "2-1",
        name: "长任务 A",
        startTime: dayjs().subtract(10, "day").toISOString(),
        endTime: dayjs().add(10, "day").toISOString(),
      },
      {
        id: "2-2",
        name: "长任务 B",
        startTime: dayjs().subtract(5, "day").toISOString(),
        endTime: dayjs().add(15, "day").toISOString(),
      },
    ],
  },
  {
    id: "3",
    name: "分组 3 (多任务测试滚动)",
    type: "group",
    startTime: "",
    endTime: "",
    children: Array.from({ length: 15 }).map((_, i) => ({
      id: `3-${i}`,
      name: `测试任务 ${i + 1}`,
      startTime: dayjs().add(1, "month").add(i, "day").toISOString(),
      endTime: dayjs()
        .add(1, "month")
        .add(i + 2, "day")
        .toISOString(),
    })),
  },
  {
    id: "4",
    name: "分组 4 (空分组)",
    type: "group",
    startTime: dayjs().add(3, "month").toISOString(), // 空分组也可以手动指定时间
    endTime: dayjs().add(3, "month").add(5, "day").toISOString(),
    children: [],
  },
  {
    id: "5",
    name: "分组 5 (限制测试)",
    type: "group",
    startTime: "",
    endTime: "",
    limitStartTime: dayjs().add(5, "day").toISOString(),
    limitEndTime: dayjs().add(10, "day").toISOString(),
    children: [
      {
        id: "5-1",
        name: "任务 A",
        startTime: dayjs().add(6, "day").toISOString(),
        endTime: dayjs().add(8, "day").toISOString(),
      },
      {
        id: "5-2",
        name: "任务 B",
        startTime: dayjs().add(9, "day").toISOString(),
        endTime: dayjs().add(12, "day").toISOString(),
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
            startTime: dayjs().toISOString(),
            endTime: dayjs().add(2, "day").toISOString(),
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
  console.group("时间轴进入触发");
  items.forEach((item) => {
    const { task, block, instant } = item;
    let msg = `进入: [${task.name}]`;
    if (block) msg += ` - 块: [${block.name}]`;
    if (instant) msg += ` - 瞬时点: [${instant.name}]`;
    console.log(msg, item);
  });
  console.groupEnd();
};

/**
 * 时间轴播放离开任务范围时的回调
 * @param items - 离开时间范围的任务集合
 */
const handleTaskLeave = (
  items: { task: GanttTask; block?: any; instant?: any }[]
) => {
  console.group("时间轴离开触发");
  items.forEach((item) => {
    const { task, block } = item;
    let msg = `离开: [${task.name}]`;
    if (block) msg += ` - 块: [${block.name}]`;
    console.log(msg, item);
  });
  console.groupEnd();
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
 * 更新任务列表处理函数
 * @param tasks - 更新后的任务列表
 */
const handleUpdateTasks = (tasks: (GanttTask | GanttGroup)[]) => {
  console.log("******************************更新任务列表:", tasks);
};

/**
 * 更新任务处理函数
 * @param task - 更新后的任务对象
 */
const handleUpdateTask = (task: GanttTask) => {
  console.log("******************************更新任务:", task);
};

onMounted(() => {
  if (viewerRef.value) {
    // 初始化 Mars3D Map
    mapInstance.value = new mars3d.Map(viewerRef.value as any, {
      scene: {
        center: {
          lat: 30.054604,
          lng: 108.885436,
          alt: 17036414,
          heading: 0,
          pitch: -90,
        },
      },
      control: {
        // 保持和之前 Cesium 类似的简洁配置
        baseLayerPicker: false,
        timeline: true,
        animation: true,
        infoBox: false,
        selectionIndicator: false,
      },
    });

    // 获取内部 Cesium Viewer 实例供甘特图组件使用
    // @ts-ignore
    window.viewer = mapInstance.value.viewer;

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

  isViewerReady.value = true;
});

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
    // @ts-ignore
    window.viewer = undefined;
  }
});
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

        <!-- 右侧时间轴任务块/行右键菜单插槽 -->
        <template #barContextMenu="{ task, block, instant, close }">
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

            <!-- 单项 (瞬时点) -->
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

<style>
body {
  margin: 0;
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
