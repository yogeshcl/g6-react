"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.radialLayout = exports.proccessToFunc = exports.buildTextureDataWithTwoEdgeAttr = exports.buildTextureDataWithOneEdgeAttr = exports.buildTextureData = exports.attributesToTextureData = exports.arrayToTextureData = void 0;
var _g6Core = require("@antv/g6-core");
var _util = require("@antv/util");
var traverseTree = _g6Core.Util.traverseTree;
/**
 * 将 number | Function 类型的参数转换为 return number 的 Function
 * @param  {number | Function}  value 需要被转换的值
 * @param  {number}  defaultV 返回函数的默认返回值
 * @return {Function} 转换后的函数
 */
var proccessToFunc = function proccessToFunc(value, defaultV) {
  var func;
  if (!value) {
    func = function func(d) {
      return defaultV || 1;
    };
  } else if ((0, _util.isNumber)(value)) {
    func = function func(d) {
      return value;
    };
  } else {
    func = value;
  }
  return func;
};
/**
 * 将节点和边数据转换为 GPU 可读的数组。并返回 maxEdgePerVetex，每个节点上最多的边数
 * @param  {NodeConfig[]}  nodes 需要被转换的值
 * @param  {EdgeConfig[]}  edges 返回函数的默认返回值
 * @return {Object} 转换后的数组及 maxEdgePerVetex 组成的对象
 */
exports.proccessToFunc = proccessToFunc;
var buildTextureData = function buildTextureData(nodes, edges) {
  var dataArray = [];
  var nodeDict = [];
  var mapIdPos = {};
  var i = 0;
  for (i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    mapIdPos[n.id] = i;
    dataArray.push(n.x);
    dataArray.push(n.y);
    dataArray.push(0);
    dataArray.push(0);
    nodeDict.push([]);
  }
  for (i = 0; i < edges.length; i++) {
    var e = edges[i];
    nodeDict[mapIdPos[e.source]].push(mapIdPos[e.target]);
    nodeDict[mapIdPos[e.target]].push(mapIdPos[e.source]);
  }
  var maxEdgePerVetex = 0;
  for (i = 0; i < nodes.length; i++) {
    var offset = dataArray.length;
    var dests = nodeDict[i];
    var len = dests.length;
    dataArray[i * 4 + 2] = offset;
    dataArray[i * 4 + 3] = dests.length;
    maxEdgePerVetex = Math.max(maxEdgePerVetex, dests.length);
    for (var j = 0; j < len; ++j) {
      var dest = dests[j];
      dataArray.push(+dest);
    }
  }
  while (dataArray.length % 4 !== 0) {
    dataArray.push(0);
  }
  return {
    array: new Float32Array(dataArray),
    maxEdgePerVetex: maxEdgePerVetex
  };
};
/**
 * 将节点和边数据转换为 GPU 可读的数组，每条边带有一个属性。并返回 maxEdgePerVetex，每个节点上最多的边数
 * @param  {NodeConfig[]}  nodes 节点数组
 * @param  {EdgeConfig[]}  edges 边数组
 * @param  {Function}  attrs 读取边属性的函数
 * @return {Object} 转换后的数组及 maxEdgePerVetex 组成的对象
 */
exports.buildTextureData = buildTextureData;
var buildTextureDataWithOneEdgeAttr = function buildTextureDataWithOneEdgeAttr(nodes, edges, attrs) {
  var dataArray = [];
  var nodeDict = [];
  var mapIdPos = {};
  var i = 0;
  for (i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    mapIdPos[n.id] = i;
    dataArray.push(n.x);
    dataArray.push(n.y);
    dataArray.push(0);
    dataArray.push(0);
    nodeDict.push([]);
  }
  for (i = 0; i < edges.length; i++) {
    var e = edges[i];
    nodeDict[mapIdPos[e.source]].push(mapIdPos[e.target]);
    nodeDict[mapIdPos[e.source]].push(attrs(e)); // 理想边长，后续可以改成每条边不同
    nodeDict[mapIdPos[e.target]].push(mapIdPos[e.source]);
    nodeDict[mapIdPos[e.target]].push(attrs(e)); // 理想边长，后续可以改成每条边不同
  }

  var maxEdgePerVetex = 0;
  for (i = 0; i < nodes.length; i++) {
    var offset = dataArray.length;
    var dests = nodeDict[i]; // dest 中节点 id 与边长间隔存储，即一位节点 id，一位边长……
    var len = dests.length;
    dataArray[i * 4 + 2] = offset;
    dataArray[i * 4 + 3] = len / 2; // 第四位存储与该节点相关的所有节点个数
    maxEdgePerVetex = Math.max(maxEdgePerVetex, len / 2);
    for (var j = 0; j < len; ++j) {
      var dest = dests[j];
      dataArray.push(+dest);
    }
  }
  // 不是 4 的倍数，填充 0
  while (dataArray.length % 4 !== 0) {
    dataArray.push(0);
  }
  return {
    array: new Float32Array(dataArray),
    maxEdgePerVetex: maxEdgePerVetex
  };
};
/**
 * 将节点和边数据转换为 GPU 可读的数组，每条边带有一个以上属性。并返回 maxEdgePerVetex，每个节点上最多的边数
 * @param  {NodeConfig[]}  nodes 节点数组
 * @param  {EdgeConfig[]}  edges 边数组
 * @param  {Function}  attrs 读取边属性的函数
 * @return {Object} 转换后的数组及 maxEdgePerVetex 组成的对象
 */
exports.buildTextureDataWithOneEdgeAttr = buildTextureDataWithOneEdgeAttr;
var buildTextureDataWithTwoEdgeAttr = function buildTextureDataWithTwoEdgeAttr(nodes, edges, attrs1, attrs2) {
  var dataArray = [];
  var nodeDict = [];
  var mapIdPos = {};
  var i = 0;
  for (i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    mapIdPos[n.id] = i;
    dataArray.push(n.x);
    dataArray.push(n.y);
    dataArray.push(0);
    dataArray.push(0);
    nodeDict.push([]);
  }
  for (i = 0; i < edges.length; i++) {
    var e = edges[i];
    nodeDict[mapIdPos[e.source]].push(mapIdPos[e.target]);
    nodeDict[mapIdPos[e.source]].push(attrs1(e));
    nodeDict[mapIdPos[e.source]].push(attrs2(e));
    nodeDict[mapIdPos[e.source]].push(0);
    nodeDict[mapIdPos[e.target]].push(mapIdPos[e.source]);
    nodeDict[mapIdPos[e.target]].push(attrs1(e));
    nodeDict[mapIdPos[e.target]].push(attrs2(e));
    nodeDict[mapIdPos[e.target]].push(0);
  }
  var maxEdgePerVetex = 0;
  for (i = 0; i < nodes.length; i++) {
    var offset = dataArray.length;
    var dests = nodeDict[i]; // dest 中节点 id 与边长间隔存储，即一位节点 id，一位边长……
    var len = dests.length;
    // dataArray[i * 4 + 2] = offset;
    // dataArray[i * 4 + 3] = len / 4; // 第四位存储与该节点相关的所有节点个数
    // pack offset & length into float32: offset 20bit, length 12bit
    dataArray[i * 4 + 2] = offset + 1048576 * len / 4;
    dataArray[i * 4 + 3] = 0; // 第四位存储与上一次的距离差值
    maxEdgePerVetex = Math.max(maxEdgePerVetex, len / 4);
    for (var j = 0; j < len; ++j) {
      var dest = dests[j];
      dataArray.push(+dest);
    }
  }
  // 不是 4 的倍数，填充 0
  while (dataArray.length % 4 !== 0) {
    dataArray.push(0);
  }
  return {
    array: new Float32Array(dataArray),
    maxEdgePerVetex: maxEdgePerVetex
  };
};
/**
 * transform the extended attributes of nodes or edges to a texture array
 * @param  {string[]}  attributeNames attributes' name to be read from items and put into output array
 * @param  {ModelConfig[]}  items the items to be read
 * @return {Float32Array} the attributes' value array to be read by GPU
 */
exports.buildTextureDataWithTwoEdgeAttr = buildTextureDataWithTwoEdgeAttr;
var attributesToTextureData = function attributesToTextureData(attributeNames, items) {
  var dataArray = [];
  var attributeNum = attributeNames.length;
  var attributteStringMap = {};
  items.forEach(function (item) {
    attributeNames.forEach(function (name, i) {
      if (attributteStringMap[item[name]] === undefined) {
        attributteStringMap[item[name]] = Object.keys(attributteStringMap).length;
      }
      dataArray.push(attributteStringMap[item[name]]);
      // insure each node's attributes take inter number of grids
      if (i === attributeNum - 1) {
        while (dataArray.length % 4 !== 0) {
          dataArray.push(0);
        }
      }
    });
  });
  return {
    array: new Float32Array(dataArray),
    count: Object.keys(attributteStringMap).length
  };
};
/**
 * transform the number array format of extended attributes of nodes or edges to a texture array
 * @param  {string[]}  attributeNames attributes' name to be read from items and put into output array
 * @return {Float32Array} the attributes' value array to be read by GPU
 */
exports.attributesToTextureData = attributesToTextureData;
var arrayToTextureData = function arrayToTextureData(valueArrays) {
  var dataArray = [];
  var attributeNum = valueArrays.length;
  var itemNum = valueArrays[0].length;
  var _loop_1 = function _loop_1(j) {
    valueArrays.forEach(function (valueArray, i) {
      dataArray.push(valueArray[j]);
      // insure each node's attributes take inter number of grids
      if (i === attributeNum - 1) {
        while (dataArray.length % 4 !== 0) {
          dataArray.push(0);
        }
      }
    });
  };
  for (var j = 0; j < itemNum; j++) {
    _loop_1(j);
  }
  return new Float32Array(dataArray);
};
/**
 *
 * @param data Tree graph data
 * @param layout
 */
exports.arrayToTextureData = arrayToTextureData;
var radialLayout = function radialLayout(data, layout) {
  // 布局方式有 H / V / LR / RL / TB / BT
  var VERTICAL_LAYOUTS = ['V', 'TB', 'BT'];
  var min = {
    x: Infinity,
    y: Infinity
  };
  var max = {
    x: -Infinity,
    y: -Infinity
  };
  // 默认布局是垂直布局TB，此时x对应rad，y对应r
  var rScale = 'x';
  var radScale = 'y';
  if (layout && VERTICAL_LAYOUTS.indexOf(layout) >= 0) {
    // 若是水平布局，y对应rad，x对应r
    radScale = 'x';
    rScale = 'y';
  }
  var count = 0;
  traverseTree(data, function (node) {
    count++;
    if (node.x > max.x) {
      max.x = node.x;
    }
    if (node.x < min.x) {
      min.x = node.x;
    }
    if (node.y > max.y) {
      max.y = node.y;
    }
    if (node.y < min.y) {
      min.y = node.y;
    }
    return true;
  });
  var avgRad = Math.PI * 2 / count;
  var radDiff = max[radScale] - min[radScale];
  if (radDiff === 0) {
    return data;
  }
  traverseTree(data, function (node) {
    var radial = (node[radScale] - min[radScale]) / radDiff * (Math.PI * 2 - avgRad) + avgRad;
    var r = Math.abs(rScale === 'x' ? node.x - data.x : node.y - data.y);
    node.x = r * Math.cos(radial);
    node.y = r * Math.sin(radial);
    return true;
  });
  return data;
};
exports.radialLayout = radialLayout;