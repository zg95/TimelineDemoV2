import dayjs from "dayjs";

type TaskType = "construct" | "demolish";

export interface ModelTask {
  ids: string[];
  startTime: number;
  endTime: number;
  type: TaskType;
}

export class ModelManager {
  layer: any = null;
  tasks: ModelTask[] = [];
  staticIds: string[] = []; // 从头到尾一直显示的构件ID

  /**
   * 设置关联的图层
   */
  setLayer(layer: any) {
    this.layer = layer;
    // 初始化时设置为全透明 (根据用户要求：整体模型透明)
    if (this.layer) {
      this.layer.style = new mars3d.Cesium.Cesium3DTileStyle({
        color: "color('255, 255, 255', 0)",
      });
    }
  }

  /**
   * 添加常显构件
   */
  addStaticComponents(ids: string[]) {
    this.staticIds.push(...ids);
  }

  /**
   * 添加施工任务 (透明度 0 -> 1)
   */
  addConstructionTask(
    ids: string[],
    startTime: string | number,
    endTime: string | number
  ) {
    this.addTask(ids, startTime, endTime, "construct");
  }

  /**
   * 添加拆除任务 (透明度 1 -> 0)
   */
  addDemolitionTask(
    ids: string[],
    startTime: string | number,
    endTime: string | number
  ) {
    this.addTask(ids, startTime, endTime, "demolish");
  }

  private addTask(
    ids: string[],
    startTime: string | number,
    endTime: string | number,
    type: TaskType
  ) {
    this.tasks.push({
      ids,
      startTime: dayjs(startTime).valueOf(),
      endTime: dayjs(endTime).valueOf(),
      type,
    });
  }

  /**
   * 清除所有任务
   */
  clearTasks() {
    this.tasks = [];
    this.staticIds = [];
  }

  /**
   * 根据当前时间更新模型状态
   * @param currentTime 当前时间 (时间戳或字符串)
   */
  updateTime(currentTime: string | number) {
    if (!this.layer) return;
    const current = dayjs(currentTime).valueOf();
    // 使用真实时间控制闪烁，避免受播放倍速影响。每200ms变换一次颜色 (加快频率)。
    const now = Date.now();
    const isFlashPhase = Math.floor(now / 200) % 2 === 0;

    // 预处理：将任务按ID分组
    const idTaskMap = new Map<string, ModelTask[]>();
    this.tasks.forEach((task) => {
      task.ids.forEach((id) => {
        if (!idTaskMap.has(id)) {
          idTaskMap.set(id, []);
        }
        idTaskMap.get(id)!.push(task);
      });
    });

    // 存储每个ID对应的透明度和颜色
    const idStateMap = new Map<
      string,
      {
        alpha: number;
        color: string;
      }
    >();

    // 获取所有涉及的ID
    const allIds = new Set<string>([...this.staticIds, ...idTaskMap.keys()]);

    allIds.forEach((id) => {
      let alpha = 0;
      let color = "'rgb(250, 250, 250)'";

      // 如果是常显构件，默认可见
      if (this.staticIds.includes(id)) {
        alpha = 1;
      }

      const tasks = idTaskMap.get(id);
      if (tasks && tasks.length > 0) {
        // 按时间排序任务
        tasks.sort((a, b) => a.startTime - b.startTime);

        // 寻找决定当前状态的任务
        let lastFinishedTask: ModelTask | null = null;
        const activeTasks: ModelTask[] = [];

        for (const task of tasks) {
          if (current > task.endTime) {
            // 任务已结束
            if (!lastFinishedTask || task.endTime > lastFinishedTask.endTime) {
              lastFinishedTask = task;
            }
          } else if (current >= task.startTime) {
            // 任务进行中
            activeTasks.push(task);
          }
        }

        // 确定基础状态
        if (lastFinishedTask) {
          alpha = lastFinishedTask.type === "demolish" ? 0 : 1;
        } else {
          // 如果没有已完成的任务，检查是否为常显构件
          if (this.staticIds.includes(id)) {
            alpha = 1;
          }
        }

        // 如果有活跃任务，由活跃任务决定状态
        if (activeTasks.length > 0) {
          // 1. 找到开始时间最晚的任务，以确定主导类型 (Construct/Demolish)
          const latestTask = activeTasks[activeTasks.length - 1];
          const dominantType = latestTask.type;

          const sameTypeTasks = activeTasks.filter(
            (t) => t.type === dominantType
          );

          if (dominantType === "construct") {
            let maxAlpha = -1;
            for (const t of sameTypeTasks) {
              const dur = Math.max(t.endTime - t.startTime, 1);
              const p = Math.max(0, Math.min(1, (current - t.startTime) / dur));
              if (p > maxAlpha) {
                maxAlpha = p;
              }
            }
            alpha = maxAlpha;

            if (alpha > 0.8 && isFlashPhase) {
              color = "'rgb(135, 206, 250)'";
            }
          } else {
            // Demolish
            let minAlpha = 2;
            for (const t of sameTypeTasks) {
              const dur = Math.max(t.endTime - t.startTime, 1);
              const p = Math.max(0, Math.min(1, (current - t.startTime) / dur));
              const a = 1 - p;
              if (a < minAlpha) {
                minAlpha = a;
              }
            }
            alpha = minAlpha;
            const p = 1 - alpha;
            if (p > 0.8 && isFlashPhase) {
              color = "'rgb(240, 128, 128)'";
            }
          }
        } else if (lastFinishedTask) {
          // 保持上一个任务结束的状态
        } else {
          // 初始状态
          const firstTask = tasks[0];
          if (firstTask.type === "construct") {
            alpha = 0;
          } else {
            if (!this.staticIds.includes(id)) {
              alpha = 1;
            }
          }
        }
      }

      idStateMap.set(id, { alpha, color });
    });

    // 更新样式
    this.applyStyle(idStateMap);
  }

  /**
   * 更新样式
   */
  private applyStyle(
    idStateMap: Map<
      string,
      {
        alpha: number;
        color: string;
      }
    >
  ) {
    // 将相同透明度和颜色的ID分组，优化样式条件数量
    const styleGroups = new Map<string, string[]>();
    idStateMap.forEach((state, id) => {
      const a = Math.floor(state.alpha * 100) / 100;
      const key = `${state.color}|${a}`;
      if (!styleGroups.has(key)) {
        styleGroups.set(key, []);
      }
      styleGroups.get(key)!.push(id);
    });

    // 构建 Cesium 3D Tiles 样式条件
    const styleConditions: any[] = [];
    styleGroups.forEach((ids, key) => {
      if (ids.length > 0) {
        const [c, a] = key.split("|");
        const idCond = ids.map((id) => `\${id} === '${id}'`).join(" || ");
        styleConditions.push([idCond, `color(${c}, ${a})`]);
      }
    });

    styleConditions.push(["true", "color('255, 255, 255', 0)"]);

    const newStyle = new mars3d.Cesium.Cesium3DTileStyle({
      color: {
        conditions: styleConditions,
      },
    });
    // console.log(
    //   "******************************newStyle:",
    //   this.layer,
    //   newStyle
    // );
    if (this.layer.ready) {
      this.layer.style = newStyle;
    } else if (this.layer.readyPromise) {
      this.layer.readyPromise.then(() => {
        this.layer.style = newStyle;
      });
    } else {
      // 增加 try-catch 避免 Mars3D 内部在 tileset 未准备好时设置样式报错
      try {
        if (this.layer) this.layer.style = newStyle;
      } catch (e) { }
    }
  }
}
