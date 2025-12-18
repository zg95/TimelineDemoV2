# chbim-time-axis-v2

[![npm version](https://img.shields.io/npm/v/chbim-time-axis-v2.svg?style=flat-square)](https://www.npmjs.com/package/chbim-time-axis-v2)
[![License](https://img.shields.io/npm/l/chbim-time-axis-v2.svg?style=flat-square)](https://www.npmjs.com/package/chbim-time-axis-v2)
[![Downloads](https://img.shields.io/npm/dt/chbim-time-axis-v2.svg?style=flat-square)](https://www.npmjs.com/package/chbim-time-axis-v2)

一个专为 Vue 3 + Cesium 设计的甘特图组件。它不仅是一个任务管理工具，更是连接二维时间数据与三维空间展示的桥梁。

## ✨ 核心特性

- **🤝 深度 Cesium 集成**:
  - **双向同步**: 甘特图的时间轴与 Cesium Viewer 的时钟（Clock）完全同步。拖动甘特图时间轴会更新 Cesium 场景时间，反之亦然。
  - **二三维联动**: 当时间轴播放到特定任务时，会触发事件，方便开发者在三维场景中控制模型的显隐、动画等。
- **📅 多维任务模型**:
  - **普通任务 (Task)**: 标准的起止时间任务。
  - **任务组 (Group)**: 可折叠的任务容器，支持自动计算时间范围和手动限制范围。
  - **时间块 (Block)**: 单个任务行内包含多个不连续的时间段（如间歇性作业）。
  - **瞬时点 (Instant)**: 标记特定时间点的关键事件（如里程碑、检查点）。
- **🎨 高度可定制**:
  - **插槽 (Slots)**: 提供工具栏、任务操作列、右键菜单等多个插槽，满足个性化 UI 需求。
  - **样式**: 支持自定义任务颜色、瞬时点颜色等。
- **⚡ 开发体验**:
  - **TypeScript**: 提供完整的类型定义。
  - **Vue 3**: 基于 Composition API 构建，响应式性能优秀。

## 📦 安装

```bash
npm install chbim-time-axis-v2
```

## 🚀 快速开始

### 1. 引入样式

在你的入口文件（如 `main.ts`）中引入 CSS：

```typescript
import "chbim-time-axis-v2/style.css";
```

### 2. 基本使用

在 Vue 组件中使用：

```vue
<template>
  <div class="layout">
    <div ref="cesiumContainer" class="cesium-view"></div>
    <div class="gantt-view">
      <CesiumGantt
        v-if="isViewerReady"
        :viewer="getViewer()"
        v-model:tasks="tasks"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { CesiumGantt, type GanttTask } from "chbim-time-axis-v2";
import * as Cesium from "cesium";
import dayjs from "dayjs";

// 建议将 Cesium 对象挂载到 window 上，避免 Vue 的响应式代理带来的性能开销
// @ts-ignore
window.Cesium = Cesium;

const cesiumContainer = ref<HTMLElement>();
const isViewerReady = ref(false);

const getViewer = () => {
  // @ts-ignore
  return window.viewer;
};

const tasks = ref<GanttTask[]>([
  {
    id: "1",
    name: "基础工程",
    startTime: dayjs().toISOString(),
    endTime: dayjs().add(5, "day").toISOString(),
    type: "task",
  },
]);

onMounted(() => {
  if (cesiumContainer.value) {
    // 初始化 Cesium Viewer 并挂载到 window
    // @ts-ignore
    window.viewer = new Cesium.Viewer(cesiumContainer.value, {
      timeline: false, // 建议关闭原生 timeline，使用本组件代替
      animation: false,
    });

    isViewerReady.value = true;
  }
});

onUnmounted(() => {
  // @ts-ignore
  if (window.viewer) {
    // @ts-ignore
    window.viewer.destroy();
    // @ts-ignore
    window.viewer = undefined;
  }
});
</script>

<style>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.cesium-view {
  flex: 1;
}
.gantt-view {
  height: 300px;
}
</style>
```

## 📊 数据结构详解

组件的核心是 `tasks` 数组。理解不同的任务类型对于发挥组件潜力至关重要。

### 1. 通用接口

所有任务类型都遵循的基本结构：

```typescript
interface GanttTask {
  id: string;
  name: string;
  startTime: string; // ISO 8601 格式 (e.g., "2023-01-01T09:00:00Z")
  endTime: string; // ISO 8601 格式
  type?: "task" | "group" | "block" | "instant"; // 默认为 'task'
  parentId?: string;
  warning?: string; // 内部计算的警告信息
  allowInstant?: boolean; // 是否允许在此任务行上右键添加瞬时点
  attr?: Record<string, any>; // 自定义属性
  class?: string; // 自定义类名
}
```

### 2. 普通任务 (Task)

最基础的任务类型，由开始时间和结束时间定义。

- **行为**: 在甘特图上显示为连续的条形，支持拖拽移动和拖拽边缘调整大小。
- **数据**: 直接使用通用接口中的 `startTime` 和 `endTime`。

### 3. 任务组 (Group)

用于组织子任务。时间范围通常由子任务决定，但也可以设置限制范围。

```typescript
interface GanttGroup extends GanttTask {
  type: "group";
  children: GanttTask[]; // 子任务列表
  collapsed?: boolean; // 是否折叠

  // 如果设置，子任务超出此范围会显示警告
  limitStartTime?: string;
  limitEndTime?: string;
}
```

### 4. 块状任务 (Block)

适用于同一行展示多个不连续的时间段。

```typescript
interface TaskBlock {
  startTime: string;
  endTime: string;
  name?: string;
  color?: string; // 支持 HEX, RGB 等 CSS 颜色值
  attr?: Record<string, any>; // 自定义属性
  class?: string; // 自定义类名
}

// 在 GanttTask 中使用
interface BlockTask extends GanttTask {
  type: "block";
  blocks: TaskBlock[]; // 时间块数组
}
```

### 5. 瞬时任务 (Instant)

适用于展示时间点事件。

```typescript
interface TaskInstant {
  id: string;
  time: string;
  name?: string;
  color?: string;
  attr?: Record<string, any>; // 自定义属性
  class?: string; // 自定义类名
}

// 在 GanttTask 中使用
interface InstantTask extends GanttTask {
  type: "instant";
  instants: TaskInstant[]; // 瞬时点数组
}
```

## ⚙️ 组件 API

### Props (属性)

| 属性名   | 类型            | 必填 | 默认值 | 描述                                                                       |
| :------- | :-------------- | :--- | :----- | :------------------------------------------------------------------------- |
| `tasks`  | `GanttTask[]`   | ✅   | `[]`   | 任务数据源，支持 `v-model:tasks` 双向绑定。                                |
| `viewer` | `Cesium.Viewer` | ❌   | -      | Cesium Viewer 实例。传入后组件会自动绑定时钟。                             |
| `clock`  | `Cesium.Clock`  | ❌   | -      | 单独传入 Cesium Clock 实例。如果传入 `viewer`，则优先使用 `viewer.clock`。 |

### Events (事件)

| 事件名         | 参数 (Payload)                        | 描述                                                                           |
| :------------- | :------------------------------------ | :----------------------------------------------------------------------------- |
| `update:tasks` | `tasks: GanttTask[]`                  | 当任务数据发生变化（拖拽、调整大小、编辑属性）时触发。                         |
| `taskUpdate`   | `task: GanttTask`                     | 单个任务发生更新时触发。                                                       |
| `task-enter`   | `items: { task, block?, instant? }[]` | 当时间轴播放**进入**任务/块/瞬时点的时间范围时触发。这是二三维联动的核心事件。 |
| `task-leave`   | `items: { task, block?, instant? }[]` | 当时间轴播放**离开**任务/块/瞬时点的时间范围时触发。                           |
| `add`          | `parentId: string`                    | 点击分组行的 "+" 按钮时触发。                                                  |
| `delete`       | `taskId: string`                      | 点击删除按钮时触发。                                                           |

### Methods (暴露方法)

通过 `ref` 获取组件实例后可调用的方法：

| 方法名           | 参数 | 描述           |
| :--------------- | :--- | :------------- |
| `toggleMaximize` | -    | 切换最大化模式 |
| `toggleMinimize` | -    | 切换最小化模式 |

### Slots (插槽)

组件提供了丰富的插槽用于自定义 UI。

#### 1. `toolbar` (顶部工具栏)

自定义时间轴上方的控制区域。

```vue
<template #toolbar="{ togglePlay, isPlaying, handleResetView }">
  <button @click="togglePlay">{{ isPlaying ? "暂停" : "开始" }}</button>
  <button @click="handleResetView">重置视角</button>
  <!-- 添加自定义按钮 -->
  <button @click="myCustomAction">导出报表</button>
</template>
```

#### 2. `taskOp` (任务列表操作列)

自定义任务列表右侧的操作按钮。

```vue
<template #taskOp="{ item }">
  <button @click="editTask(item)">编辑</button>
  <button @click="deleteTask(item.id)" style="color: red">删除</button>
</template>
```

#### 3. `barContextMenu` (右键菜单)

自定义在甘特图条上右键点击时出现的菜单。

```vue
<template #barContextMenu="{ task, block, instant, close }">
  <div class="my-context-menu">
    <div class="menu-header">
      {{ block ? block.name : instant ? instant.name : task.name }}
    </div>
    <div
      @click="
        viewDetails(task);
        close();
      "
    >
      查看详情
    </div>
    <div
      @click="
        deleteItem(task);
        close();
      "
    >
      删除
    </div>
  </div>
</template>
```

#### 4. 内容定制插槽

支持自定义任务条、时间块和瞬时点的内容渲染。

- `barContent`: 自定义普通任务条的内容。参数: `{ bar: GanttTask }`
- `blockContent`: 自定义时间块的内容。参数: `{ block: TaskBlock, task: GanttTask }`
- `instantContent`: 自定义瞬时点的内容。参数: `{ instant: TaskInstant, task: GanttTask }`

```vue
<template #barContent="{ bar }">
  <div class="my-bar-content">{{ bar.name }}</div>
</template>

<template #blockContent="{ block }">
  <span>{{ block.name }}</span>
</template>
```

## 🧩 Cesium 联动机制

组件通过 `Cesium.Clock.onTick` 事件与 Cesium 保持高频同步：

1.  **时间同步**: 甘特图的 `currentTime` 会实时更新为 Cesium 的当前时间。
2.  **播放控制**: 点击甘特图的播放按钮会控制 `viewer.clock.shouldAnimate`。
3.  **视口跟随**: 当播放时间超出当前甘特图可视范围时，时间轴会自动滚动以保持当前时间可见。

## ❓ 常见问题

**Q: 如何自定义任务条的颜色？**
A:

- 对于 `block` 类型，在 `blocks` 数组中指定 `color` 属性。
- 对于 `instant` 类型，在 `instants` 数组中指定 `color` 属性。
- 对于普通 `task`，建议在任务对象中设置 `class` 属性，并通过自定义 CSS 类来控制颜色。例如：
  ```css
  .my-red-task {
    background-color: red !important;
  }
  ```

**Q: 添加瞬时点（Instant）的功能在哪里？**
A: 在设置了 `allowInstant: true` 的任务行（非分组）对应的空白时间轴区域**右键点击**，会弹出内置菜单 "添加瞬时任务"。
