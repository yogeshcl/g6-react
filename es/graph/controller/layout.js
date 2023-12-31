function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
import { __awaiter, __extends, __generator, __rest } from "tslib";
import { AbstractLayout, Util } from '@antv/g6-core';
import { Layout } from '../../layout';
import { LayoutWorker } from '../../layout/worker/layout';
import { LAYOUT_MESSAGE } from '../../layout/worker/layoutConst';
import { gpuDetector } from '../../util/gpu';
import { mix, clone } from '@antv/util';
// eslint-disable-next-line @typescript-eslint/no-implied-eval
var mockRaf = function mockRaf(cb) {
  return setTimeout(cb, 16);
};
var mockCaf = function mockCaf(reqId) {
  return clearTimeout(reqId);
};
var helper = {
  // pollyfill
  requestAnimationFrame: function requestAnimationFrame(callback) {
    var fn = typeof window !== 'undefined' ? window.requestAnimationFrame || window.webkitRequestAnimationFrame || mockRaf : mockRaf;
    return fn(callback);
  },
  cancelAnimationFrame: function cancelAnimationFrame(requestId) {
    var fn = typeof window !== 'undefined' ? window.cancelAnimationFrame || window.webkitCancelAnimationFrame || mockCaf : mockCaf;
    return fn(requestId);
  }
};
var GPU_LAYOUT_NAMES = ['fruchterman', 'gForce'];
var LAYOUT_PIPES_ADJUST_NAMES = ['force', 'grid', 'circular'];
var LayoutController = /** @class */function (_super) {
  __extends(LayoutController, _super);
  // the configurations of the layout
  // private layoutCfg: any; // LayoutOptions
  // the type name of the layout
  // private layoutType: string;
  // private data: GraphData;
  // private layoutMethods: typeof Layout;
  function LayoutController(graph) {
    var _this = _super.call(this, graph) || this;
    _this.graph = graph;
    _this.layoutCfg = graph.get('layout') || {};
    _this.layoutType = _this.getLayoutType();
    _this.worker = null;
    _this.workerData = {};
    _this.initLayout();
    return _this;
  }
  // eslint-disable-next-line class-methods-use-this
  LayoutController.prototype.initLayout = function () {
    // no data before rendering
  };
  // get layout worker and create one if not exists
  LayoutController.prototype.getWorker = function () {
    if (this.worker) {
      return this.worker;
    }
    if (typeof Worker === 'undefined') {
      // 如果当前浏览器不支持 web worker，则不使用 web worker
      console.warn('Web worker is not supported in current browser.');
      this.worker = null;
    } else {
      this.worker = LayoutWorker(this.layoutCfg.workerScriptURL);
    }
    return this.worker;
  };
  // stop layout worker
  LayoutController.prototype.stopWorker = function () {
    var workerData = this.workerData;
    if (!this.worker) {
      return;
    }
    this.worker.terminate();
    this.worker = null;
    // 重新开始新的布局之前，先取消之前布局的requestAnimationFrame。
    if (workerData.requestId) {
      helper.cancelAnimationFrame(workerData.requestId);
      workerData.requestId = null;
    }
    if (workerData.requestId2) {
      helper.cancelAnimationFrame(workerData.requestId2);
      workerData.requestId2 = null;
    }
  };
  LayoutController.prototype.execLayoutMethod = function (layoutCfg, order) {
    var _this = this;
    return new Promise(function (reslove, reject) {
      return __awaiter(_this, void 0, void 0, function () {
        var graph, layoutType, onTick_1, animate_1, isDefaultAnimateLayout_1, tick, enableTick, layoutMethod, onTick_2, tick, layoutData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              graph = this.graph;
              if (!graph || graph.get('destroyed')) return [2 /*return*/];
              layoutType = layoutCfg.type;
              // 每个布局方法都需要注册
              layoutCfg.onLayoutEnd = function () {
                graph.emit('aftersublayout', {
                  type: layoutType
                });
                reslove();
              };
              // 若用户指定开启 gpu，且当前浏览器支持 webgl，且该算法存在 GPU 版本（目前仅支持 fruchterman 和 gForce），使用 gpu 版本的布局
              if (layoutType && this.isGPU) {
                if (!this.hasGPUVersion(layoutType)) {
                  console.warn("The '".concat(layoutType, "' layout does not support GPU calculation for now, it will run in CPU."));
                } else {
                  layoutType = "".concat(layoutType, "-gpu");
                }
              }
              if (Util.isForce(layoutType)) {
                onTick_1 = layoutCfg.onTick, animate_1 = layoutCfg.animate;
                isDefaultAnimateLayout_1 = animate_1 === undefined && (layoutType === 'force' || layoutType === 'force2');
                tick = function tick() {
                  if (onTick_1) {
                    onTick_1();
                  }
                  if (animate_1 || isDefaultAnimateLayout_1) graph.refreshPositions();
                };
                layoutCfg.tick = tick;
              } else if (layoutType === 'comboForce' || layoutType === 'comboCombined') {
                layoutCfg.comboTrees = graph.get('comboTrees');
              }
              enableTick = false;
              try {
                layoutMethod = new Layout[layoutType](layoutCfg);
                if (this.layoutMethods[order]) {
                  this.layoutMethods[order].destroy();
                }
                this.layoutMethods[order] = layoutMethod;
              } catch (e) {
                console.warn("The layout method: '".concat(layoutType, "' does not exist! Please specify it first."));
                reject();
              }
              // 是否需要迭代的方式完成布局。这里是来自布局对象的实例属性，是由布局的定义者在布局类定义的。
              enableTick = layoutMethod.enableTick;
              if (enableTick) {
                onTick_2 = layoutCfg.onTick;
                tick = function tick() {
                  if (onTick_2) {
                    onTick_2();
                  }
                  graph.refreshPositions();
                };
                layoutMethod.tick = tick;
              }
              layoutData = this.filterLayoutData(this.data, layoutCfg);
              addLayoutOrder(layoutData, order);
              layoutMethod.init(layoutData);
              // 若存在节点没有位置信息，且没有设置 layout，在 initPositions 中 random 给出了所有节点的位置，不需要再次执行 random 布局
              // 所有节点都有位置信息，且指定了 layout，则执行布局（代表不是第一次进行布局）
              graph.emit('beforesublayout', {
                type: layoutType
              });
              return [4 /*yield*/, layoutMethod.execute()];
            case 1:
              _a.sent();
              if (layoutMethod.isCustomLayout && layoutCfg.onLayoutEnd) layoutCfg.onLayoutEnd();
              return [2 /*return*/];
          }
        });
      });
    });
  };

  LayoutController.prototype.updateLayoutMethod = function (layoutMethod, layoutCfg) {
    var _this = this;
    return new Promise(function (reslove, reject) {
      return __awaiter(_this, void 0, void 0, function () {
        var graph, layoutType, layoutData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              graph = this.graph;
              layoutType = layoutCfg === null || layoutCfg === void 0 ? void 0 : layoutCfg.type;
              // 每个布局方法都需要注册
              layoutCfg.onLayoutEnd = function () {
                graph.emit('aftersublayout', {
                  type: layoutType
                });
                reslove();
              };
              layoutData = this.filterLayoutData(this.data, layoutCfg);
              layoutMethod.init(layoutData);
              layoutMethod.updateCfg(layoutCfg);
              graph.emit('beforesublayout', {
                type: layoutType
              });
              return [4 /*yield*/, layoutMethod.execute()];
            case 1:
              _a.sent();
              if (layoutMethod.isCustomLayout && layoutCfg.onLayoutEnd) layoutCfg.onLayoutEnd();
              return [2 /*return*/];
          }
        });
      });
    });
  };
  /**
   * @param {function} success callback
   * @return {boolean} 是否使用web worker布局
   */
  LayoutController.prototype.layout = function (success) {
    var _this = this;
    var _a;
    var graph = this.graph;
    if (!graph || graph.get('destroyed')) return;
    this.data = this.setDataFromGraph();
    var _b = this.data,
      nodes = _b.nodes,
      hiddenNodes = _b.hiddenNodes;
    if (!nodes) {
      return false;
    }
    var width = graph.get('width');
    var height = graph.get('height');
    var layoutCfg = {};
    Object.assign(layoutCfg, {
      width: width,
      height: height,
      center: [width / 2, height / 2]
    }, this.layoutCfg);
    this.layoutCfg = layoutCfg;
    var layoutType = layoutCfg.type;
    var prevHasNodes = false;
    (_a = this.layoutMethods) === null || _a === void 0 ? void 0 : _a.forEach(function (method) {
      var _a;
      return prevHasNodes = !!((_a = method.nodes) === null || _a === void 0 ? void 0 : _a.length) || prevHasNodes;
    });
    var preLayoutTypes = this.destoryLayoutMethods();
    graph.emit('beforelayout');
    // 增量情况下（上一次的布局与当前布局一致），上一次有节点，使用 treakInit
    if (prevHasNodes && layoutType && (preLayoutTypes === null || preLayoutTypes === void 0 ? void 0 : preLayoutTypes.length) === 1 && preLayoutTypes[0] === layoutType) {
      this.tweakInit();
    } else {
      // 初始化位置，若配置了 preset，则使用 preset 的参数生成布局作为预布局，否则使用 grid
      this.initPositions(layoutCfg.center, nodes);
    }
    // init hidden nodes
    this.initPositions(layoutCfg.center, hiddenNodes);
    // 防止用户直接用 -gpu 结尾指定布局
    if (layoutType && layoutType.split('-')[1] === 'gpu') {
      layoutType = layoutType.split('-')[0];
      layoutCfg.gpuEnabled = true;
    }
    // 若用户指定开启 gpu，且当前浏览器支持 webgl，且该算法存在 GPU 版本（目前仅支持 fruchterman 和 gForce），使用 gpu 版本的布局
    var enableGPU = false;
    if (layoutCfg.gpuEnabled) {
      enableGPU = true;
      // 打开下面语句将会导致 webworker 报找不到 window
      if (!gpuDetector().webgl) {
        console.warn("Your browser does not support webGL or GPGPU. The layout will run in CPU.");
        enableGPU = false;
      }
    }
    // the layout does not support GPU, will run in CPU
    if (enableGPU && !this.hasGPUVersion(layoutType)) {
      console.warn("The '".concat(layoutType, "' layout does not support GPU calculation for now, it will run in CPU."));
      enableGPU = false;
    }
    this.isGPU = enableGPU;
    // 在 onAllLayoutEnd 中执行用户自定义 onLayoutEnd，触发 afterlayout、更新节点位置、fitView/fitCenter、触发 afterrender
    var onLayoutEnd = layoutCfg.onLayoutEnd,
      layoutEndFormatted = layoutCfg.layoutEndFormatted,
      adjust = layoutCfg.adjust;
    if (!layoutEndFormatted) {
      layoutCfg.layoutEndFormatted = true;
      layoutCfg.onAllLayoutEnd = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                // 执行用户自定义 onLayoutEnd
                if (onLayoutEnd) {
                  onLayoutEnd(nodes);
                }
                // 更新节点位置
                this.refreshLayout();
                if (!(adjust && layoutCfg.pipes)) return [3 /*break*/, 2];
                return [4 /*yield*/, this.adjustPipesBox(this.data, adjust)];
              case 1:
                _a.sent();
                this.refreshLayout();
                _a.label = 2;
              case 2:
                // 触发 afterlayout
                graph.emit('afterlayout');
                return [2 /*return*/];
            }
          });
        });
      };
    }

    this.stopWorker();
    if (layoutCfg.workerEnabled && this.layoutWithWorker(this.data, success)) {
      // 如果启用布局web worker并且浏览器支持web worker，用web worker布局。否则回退到不用web worker布局。
      return true;
    }
    var start = Promise.resolve();
    var hasLayout = false;
    if (layoutCfg.type) {
      hasLayout = true;
      start = start.then(function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.execLayoutMethod(layoutCfg, 0)];
              case 1:
                return [2 /*return*/, _a.sent()];
            }
          });
        });
      });
    } else if (layoutCfg.pipes) {
      hasLayout = true;
      layoutCfg.pipes.forEach(function (cfg, index) {
        start = start.then(function () {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, this.execLayoutMethod(cfg, index)];
                case 1:
                  return [2 /*return*/, _a.sent()];
              }
            });
          });
        });
      });
    }
    if (hasLayout) {
      // 最后统一在外部调用onAllLayoutEnd
      start.then(function () {
        if (layoutCfg.onAllLayoutEnd) layoutCfg.onAllLayoutEnd();
        // 在执行 execute 后立即执行 success，且在 timeBar 中有 throttle，可以防止 timeBar 监听 afterrender 进行 changeData 后 layout，从而死循环
        // 对于 force 一类布局完成后的 fitView 需要用户自己在 onLayoutEnd 中配置
        if (success) success();
      }).catch(function (error) {
        console.warn('graph layout failed,', error);
      });
    } else {
      // 无布局配置
      graph.refreshPositions();
      success === null || success === void 0 ? void 0 : success();
    }
    return false;
  };
  /**
   * 增量数据初始化位置
   */
  LayoutController.prototype.tweakInit = function () {
    var _a = this,
      data = _a.data,
      graph = _a.graph;
    var nodes = data.nodes,
      edges = data.edges;
    if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) return;
    var positionMap = {};
    nodes.forEach(function (node) {
      var x = node.x,
        y = node.y;
      if (!isNaN(x) && !isNaN(y)) {
        positionMap[node.id] = {
          x: x,
          y: y
        };
        // 有位置信息，则是原有节点，增加 mass
        node.mass = node.mass || 2;
      }
    });
    edges.forEach(function (edge) {
      var source = edge.source,
        target = edge.target;
      var sourcePosition = positionMap[source];
      var targetPosition = positionMap[target];
      if (!sourcePosition && targetPosition) {
        positionMap[source] = {
          x: targetPosition.x + (Math.random() - 0.5) * 80,
          y: targetPosition.y + (Math.random() - 0.5) * 80
        };
      } else if (!targetPosition && sourcePosition) {
        positionMap[target] = {
          x: sourcePosition.x + (Math.random() - 0.5) * 80,
          y: sourcePosition.y + (Math.random() - 0.5) * 80
        };
      }
    });
    var width = graph.get('width');
    var height = graph.get('height');
    nodes.forEach(function (node) {
      var position = positionMap[node.id] || {
        x: width / 2 + (Math.random() - 0.5) * 20,
        y: height / 2 + (Math.random() - 0.5) * 20
      };
      node.x = position.x;
      node.y = position.y;
    });
  };
  LayoutController.prototype.initWithPreset = function () {
    var _a = this,
      layoutCfg = _a.layoutCfg,
      data = _a.data;
    var preset = layoutCfg.preset;
    if (!(preset === null || preset === void 0 ? void 0 : preset.type) || !Layout[preset === null || preset === void 0 ? void 0 : preset.type]) return false;
    var presetLayout = new Layout[preset === null || preset === void 0 ? void 0 : preset.type](preset);
    presetLayout.layout(data);
    delete layoutCfg.preset;
    return true;
  };
  /**
   * layout with web worker
   * @param {object} data graph data
   * @return {boolean} 是否支持web worker
   */
  LayoutController.prototype.layoutWithWorker = function (data, success) {
    var _this = this;
    var _a = this,
      layoutCfg = _a.layoutCfg,
      graph = _a.graph;
    var worker = this.getWorker();
    // 每次worker message event handler调用之间的共享数据，会被修改。
    var workerData = this.workerData;
    if (!worker) {
      return false;
    }
    workerData.requestId = null;
    workerData.requestId2 = null;
    workerData.currentTick = null;
    workerData.currentTickData = null;
    graph.emit('beforelayout');
    var start = Promise.resolve();
    var hasLayout = false;
    if (layoutCfg.type) {
      hasLayout = true;
      start = start.then(function () {
        return _this.runWebworker(worker, data, layoutCfg);
      });
    } else if (layoutCfg.pipes) {
      hasLayout = true;
      var _loop_1 = function _loop_1(cfg) {
        start = start.then(function () {
          return _this.runWebworker(worker, data, cfg);
        });
      };
      for (var _i = 0, _b = layoutCfg.pipes; _i < _b.length; _i++) {
        var cfg = _b[_i];
        _loop_1(cfg);
      }
    }
    if (hasLayout) {
      // 最后统一在外部调用onAllLayoutEnd
      start.then(function () {
        if (layoutCfg.onAllLayoutEnd) layoutCfg.onAllLayoutEnd();
        success === null || success === void 0 ? void 0 : success();
      }).catch(function (error) {
        console.error('layout failed', error);
      });
    }
    return true;
  };
  LayoutController.prototype.runWebworker = function (worker, allData, layoutCfg) {
    var _this = this;
    var isGPU = this.isGPU;
    var data = this.filterLayoutData(allData, layoutCfg);
    var nodes = data.nodes,
      edges = data.edges;
    var offScreenCanvas = document.createElement('canvas');
    var gpuWorkerAbility = isGPU && typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/dot-notation
    window.navigator && !navigator["gpu"] &&
    // WebGPU 还不支持 OffscreenCanvas
    'OffscreenCanvas' in window && 'transferControlToOffscreen' in offScreenCanvas;
    // NOTE: postMessage的message参数里面不能包含函数，否则postMessage会报错，
    // 例如：'function could not be cloned'。
    // 详情参考：https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
    // 所以这里需要把过滤layoutCfg里的函数字段过滤掉。
    var filteredLayoutCfg = filterObject(layoutCfg, function (value) {
      return typeof value !== 'function';
    });
    if (!gpuWorkerAbility) {
      worker.postMessage({
        type: LAYOUT_MESSAGE.RUN,
        nodes: nodes,
        edges: edges,
        layoutCfg: filteredLayoutCfg
      });
    } else {
      var offscreen = offScreenCanvas.transferControlToOffscreen();
      // filteredLayoutCfg.canvas = offscreen;
      filteredLayoutCfg.type = "".concat(filteredLayoutCfg.type, "-gpu");
      worker.postMessage({
        type: LAYOUT_MESSAGE.GPURUN,
        nodes: nodes,
        edges: edges,
        layoutCfg: filteredLayoutCfg,
        canvas: offscreen
      }, [offscreen]);
    }
    return new Promise(function (reslove, reject) {
      worker.onmessage = function (event) {
        _this.handleWorkerMessage(reslove, reject, event, data, layoutCfg);
      };
    });
  };
  // success callback will be called when updating graph positions for the first time.
  LayoutController.prototype.handleWorkerMessage = function (reslove, reject, event, data, layoutCfg) {
    var _a = this,
      graph = _a.graph,
      workerData = _a.workerData;
    var eventData = event.data;
    var type = eventData.type;
    var onTick = function onTick() {
      if (layoutCfg.onTick) {
        layoutCfg.onTick();
      }
    };
    switch (type) {
      case LAYOUT_MESSAGE.TICK:
        workerData.currentTick = eventData.currentTick;
        workerData.currentTickData = eventData;
        if (!workerData.requestId) {
          workerData.requestId = helper.requestAnimationFrame(function requestId() {
            updateLayoutPosition(data, eventData);
            graph.refreshPositions();
            onTick();
            if (eventData.currentTick === eventData.totalTicks) {
              // 如果是最后一次tick
              reslove();
            } else if (workerData.currentTick === eventData.totalTicks) {
              // 注意这里workerData.currentTick可能已经不再是前面赋值时候的值了，
              // 因为在requestAnimationFrame等待时间里，可能产生新的tick。
              // 如果当前tick不是最后一次tick，并且所有的tick消息都已发出来了，那么需要用最后一次tick的数据再刷新一次。
              workerData.requestId2 = helper.requestAnimationFrame(function requestId2() {
                updateLayoutPosition(data, workerData.currentTickData);
                graph.refreshPositions();
                workerData.requestId2 = null;
                onTick();
                reslove();
              });
            }
            workerData.requestId = null;
          });
        }
        break;
      case LAYOUT_MESSAGE.END:
        // 如果没有tick消息（非力导布局）
        if (workerData.currentTick == null) {
          updateLayoutPosition(data, eventData);
          reslove();
        }
        break;
      case LAYOUT_MESSAGE.GPUEND:
        // 如果没有tick消息（非力导布局）
        if (workerData.currentTick == null) {
          updateGPUWorkerLayoutPosition(data, eventData);
          reslove();
        }
        break;
      case LAYOUT_MESSAGE.ERROR:
        console.warn('Web-Worker layout error!', eventData.message);
        reject();
        break;
      default:
        reject();
        break;
    }
  };
  // 更新布局参数
  LayoutController.prototype.updateLayoutCfg = function (cfg) {
    var _this = this;
    var _a = this,
      graph = _a.graph,
      layoutMethods = _a.layoutMethods;
    if (!graph || graph.get('destroyed')) return;
    // disableTriggerLayout 不触发重新布局，仅更新参数
    var disableTriggerLayout = cfg.disableTriggerLayout,
      otherCfg = __rest(cfg, ["disableTriggerLayout"]);
    var layoutCfg = mix({}, this.layoutCfg, otherCfg);
    this.layoutCfg = layoutCfg;
    // disableTriggerLayout 不触发重新布局，仅更新参数
    if (disableTriggerLayout) {
      return;
    }
    if (!(layoutMethods === null || layoutMethods === void 0 ? void 0 : layoutMethods.length)) {
      this.layout();
      return;
    }
    this.data = this.setDataFromGraph();
    this.stopWorker();
    if (otherCfg.workerEnabled && this.layoutWithWorker(this.data, null)) {
      // 如果启用布局web worker并且浏览器支持web worker，用web worker布局。否则回退到不用web worker布局。
      return;
    }
    graph.emit('beforelayout');
    var start = Promise.resolve();
    var hasLayout = false;
    if ((layoutMethods === null || layoutMethods === void 0 ? void 0 : layoutMethods.length) === 1) {
      hasLayout = true;
      start = start.then(function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.updateLayoutMethod(layoutMethods[0], layoutCfg)];
              case 1:
                return [2 /*return*/, _a.sent()];
            }
          });
        });
      });
    } else if (layoutMethods === null || layoutMethods === void 0 ? void 0 : layoutMethods.length) {
      hasLayout = true;
      layoutMethods.forEach(function (layoutMethod, index) {
        var currentCfg = layoutCfg.pipes[index];
        start = start.then(function () {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, this.updateLayoutMethod(layoutMethod, currentCfg)];
                case 1:
                  return [2 /*return*/, _a.sent()];
              }
            });
          });
        });
      });
    }
    if (hasLayout) {
      start.then(function () {
        if (layoutCfg.onAllLayoutEnd) layoutCfg.onAllLayoutEnd();
      }).catch(function (error) {
        console.warn('layout failed', error);
      });
    }
  };
  LayoutController.prototype.adjustPipesBox = function (data, adjust) {
    var _this = this;
    return new Promise(function (resolve) {
      var nodes = data.nodes;
      if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
        resolve();
      }
      if (!LAYOUT_PIPES_ADJUST_NAMES.includes(adjust)) {
        console.warn("The adjust type ".concat(adjust, " is not supported yet, please assign it with 'force', 'grid', or 'circular'."));
        resolve();
      }
      var layoutCfg = {
        center: _this.layoutCfg.center,
        nodeSize: function nodeSize(d) {
          return Math.max(d.height, d.width);
        },
        preventOverlap: true,
        onLayoutEnd: function onLayoutEnd() {}
      };
      // 计算出大单元
      var _a = _this.getLayoutBBox(nodes),
        groupNodes = _a.groupNodes,
        layoutNodes = _a.layoutNodes;
      var preNodes = clone(layoutNodes);
      // 根据大单元坐标的变化，调整这里面每个小单元nodes
      layoutCfg.onLayoutEnd = function () {
        layoutNodes === null || layoutNodes === void 0 ? void 0 : layoutNodes.forEach(function (ele, index) {
          var _a, _b, _c;
          var dx = ele.x - ((_a = preNodes[index]) === null || _a === void 0 ? void 0 : _a.x);
          var dy = ele.y - ((_b = preNodes[index]) === null || _b === void 0 ? void 0 : _b.y);
          (_c = groupNodes[index]) === null || _c === void 0 ? void 0 : _c.forEach(function (n) {
            n.x += dx;
            n.y += dy;
          });
        });
        resolve();
      };
      var layoutMethod = new Layout[adjust](layoutCfg);
      layoutMethod.layout({
        nodes: layoutNodes
      });
    });
  };
  LayoutController.prototype.hasGPUVersion = function (layoutName) {
    return GPU_LAYOUT_NAMES.includes(layoutName);
  };
  LayoutController.prototype.destroy = function () {
    this.destoryLayoutMethods();
    var worker = this.worker;
    if (worker) {
      worker.terminate();
      this.worker = null;
    }
    this.destroyed = true;
    this.graph.set('layout', undefined);
    this.layoutCfg = undefined;
    this.layoutType = undefined;
    this.layoutMethods = undefined;
    this.graph = null;
  };
  return LayoutController;
}(AbstractLayout);
export default LayoutController;
function updateLayoutPosition(data, layoutData) {
  var nodes = data.nodes;
  var layoutNodes = layoutData.nodes;
  var nodeLength = nodes.length;
  for (var i = 0; i < nodeLength; i++) {
    var node = nodes[i];
    node.x = layoutNodes[i].x;
    node.y = layoutNodes[i].y;
  }
}
function filterObject(collection, callback) {
  var result = {};
  if (collection && _typeof(collection) === 'object') {
    Object.keys(collection).forEach(function (key) {
      if (collection.hasOwnProperty(key) && callback(collection[key])) {
        result[key] = collection[key];
      }
    });
    return result;
  }
  return collection;
}
function updateGPUWorkerLayoutPosition(data, layoutData) {
  var nodes = data.nodes;
  var vertexEdgeData = layoutData.vertexEdgeData;
  var nodeLength = nodes.length;
  for (var i = 0; i < nodeLength; i++) {
    var node = nodes[i];
    var x = vertexEdgeData[4 * i];
    var y = vertexEdgeData[4 * i + 1];
    node.x = x;
    node.y = y;
  }
}
function addLayoutOrder(data, order) {
  var _a;
  if (!((_a = data === null || data === void 0 ? void 0 : data.nodes) === null || _a === void 0 ? void 0 : _a.length)) {
    return;
  }
  var nodes = data.nodes;
  nodes.forEach(function (node) {
    node.layoutOrder = order;
  });
}