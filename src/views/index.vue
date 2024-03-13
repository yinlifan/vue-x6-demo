<template>
  <div class="container_warp">
    <!-- 顶部栏 -->
    <tool-bars>
      <div class="operating">
        <div class="btn-group">
          <div
            class="btn"
            title="圆形节点"
            @mousedown="startDrag('Circle', $event)"
          >
            <i class="iconfont icon-circle"></i>
          </div>
          <div
            class="btn"
            title="正方形节点"
            @mousedown="startDrag('Rect', $event)"
          >
            <i class="iconfont icon-square"></i>
          </div>
          <div class="btn" title="条件节点">
            <i
              class="iconfont icon-square rotate-square"
              @mousedown="startDrag('polygon', $event)"
            ></i>
          </div>
          <!-- <div class="btn">
              <img src="@/assets/table.jpg" alt="" width="90" height="90" @mousedown="startDrag('polygon',$event)">
            </div> -->
          <div class="btn-group_tips" v-if="showTips">
            拖拽生成<br />资产拓扑图形
          </div>
        </div>
        <div class="btn-group">
          <Tooltip content="直线箭头" placement="bottom">
            <div
              :class="['btn', currentArrow === 1 ? 'currentArrow' : '']"
              @click="changeEdgeType('normal')"
            >
              <i class="iconfont icon-ai28"></i>
            </div>
          </Tooltip>
          <Tooltip content="曲线箭头" placement="bottom">
            <div
              :class="['btn', currentArrow === 2 ? 'currentArrow' : '']"
              @click="changeEdgeType('smooth')"
            >
              <i class="iconfont icon-Down-Right"></i>
            </div>
          </Tooltip>
          <Tooltip content="直角箭头" placement="bottom">
            <div
              :class="['btn', currentArrow === 3 ? 'currentArrow' : '']"
              @click="changeEdgeType()"
            >
              <i class="iconfont icon-jiantou"></i>
            </div>
          </Tooltip>
        </div>
        <div class="btn-group">
          <div class="btn" @click="changeMode('edit')" title="选择模式">
            <i class="iconfont icon-mousepointershubiao"></i>
          </div>
          <div class="btn" @click="changeMode('drag')" title="拖拽模式">
            <i class="iconfont icon-tuozhuai"></i>
          </div>
        </div>
        <div class="btn-group">
          <Tooltip content="删除" placement="bottom">
            <div class="btn" @click="deleteNode()" style="margin-top: 5px;">
              <i class="iconfont icon-shanchu"></i>
            </div>
          </Tooltip>
          <Tooltip content="保存为JSON文件" placement="bottom">
            <div class="btn" @click="saveToJson()" title="保存">
              <i class="iconfont icon-baocun"></i>
            </div>
          </Tooltip>
          <Tooltip content="保存为PNG图片文件" placement="bottom">
            <div class="btn" @click="saveToPNG()" title="保存">
              <i class="iconfont icon-baocun"></i>
            </div>
          </Tooltip>
        </div>
      </div>
    </tool-bars>
    <LeftDrawer class="right_drawer">
      <div id="stencil"></div>
    </LeftDrawer>
    <div id="containerChart"></div>
    <RightDrawer
      class="right_drawer"
      :drawerType="type"
      :selectCell="selectCell"
      :graph="graph"
      :grid="grid"
      @deleteNode="deleteNode"
    >
    </RightDrawer>
    <!-- 左上方 -->
  </div>
</template>
<script>
import "@antv/x6-vue-shape";
import { Graph, Shape, Addon, FunctionExt, DataUri } from "@antv/x6";
import RightDrawer from "./components/RightDrawer";
import LeftDrawer from "./components/LeftDrawer";
import toolBars from "./components/toolBars";
import insertCss from "insert-css";
import { startDragToGraph } from "./Graph/methods.js";
// 引入JSON文件
import testImportJsons from "../../static/JSON/asset_topologys.json";

// const data = {};
export default {
  data() {
    return {
      graph: "",
      value1: true,
      type: "grid",
      selectCell: "",
      connectEdgeType: {
        //连线方式
        connector: "normal",
        router: {
          name: ""
        }
      },
      showTips: false,
      // 拓朴图标列表
      topoList: [],
      currentArrow: 1,
      grid: {
        // 网格设置
        size: 20, // 网格大小 10px
        visible: true, // 渲染网格背景
        type: "mesh",
        args: {
          color: "#D0D0D0",
          thickness: 1, // 网格线宽度/网格点大小
          factor: 10
        }
      },
      svgShape: [],
      imgUrl: "",
      // WID:"",
      // HEI:"",
      test: 1 //测试数据，等会删除
    };
  },
  components: {
    RightDrawer,
    toolBars,
    LeftDrawer
  },
  // watch: {
  //   WID:{
  //     handler(n) {
  //       console.log(n);
  //     },
  //     deep: true,
  //     immediate: true,
  //   }
  // },
  methods: {
    // 批量引入svg文件
    importAllSVG() {
      const req = require.context("@/assets/topo", true, /\.svg$/);
      const requireAll = requireContext =>
        requireContext.keys().map(requireContext);
      this.topoList = requireAll(req);
      // console.log(req);
      // console.log(this.topoList);
      // 初始化
      this.topoList.forEach((it, idx) => {
        this.svgShape.push({
          name: "", //在面板上显示图标
          type: "", //分类
          label: "" //显示文本
        });
        this.svgShape[idx].name = it;
      });
    },
    changeMode(e) {
      // e="drag"是拖拽模式，"edit"是编辑模式
      if (e === "drag") {
        this.graph.enablePanning(); // 启用画布平移
      } else {
        this.graph.disablePanning(); // 禁止画布平移
        console.log(this.graph);
      }
    },
    initX6() {
      var _that = this;
      this.graph = new Graph({
        container: document.getElementById("containerChart"),
        width: 1700,
        height: "100%",
        grid: _that.grid,
        resizing: {
          //调整节点宽高
          enabled: true,
          orthogonal: false
        },
        clipboard: true, //剪切板，默认禁用。
        // 使得快捷键生效
        keyboard: true, //键盘快捷键，默认禁用。
        // 滚轮事件，画布最大最小放大倍数
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: "ctrl", //按住ctrl键的时候滚轮事件有效
          minScale: 0.5,
          maxScale: 4
        },
        // 框选，多选
        selecting: {
          enabled: true,
          rubberband: true,
          showNodeSelectionBox: true
        },
        rotating: true, //旋转
        snapline: true, //对齐线，默认禁用。
        // panning: {
        //   enabled: false, //拖拽画布的时候是true
        //   eventTypes: ["leftMouseDown", "rightMouseDown", "mouseWheel"] //附配滚轮事件
        // },
        fitView: true, //自适应窗口
        interacting: {
          edgeLabelMovable: true
        },
        connecting: {
          // 节点连接
          anchor: "center",
          connectionPoint: "anchor",
          allowBlank: false, //如果终点在空白处时，该连线自动消失
          snap: true,
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: "#1890ff",
                  strokeWidth: 1,
                  targetMarker: {
                    name: "classic",
                    size: 8
                  },
                  strokeDasharray: 0, //虚线
                  style: {
                    animation: "ant-line 30s infinite linear"
                  }
                }
              },
              label: {
                text: ""
              },
              connector: _that.connectEdgeType.connector,
              router: {
                name: _that.connectEdgeType.router.name || ""
              },
              zIndex: 0
            });
          }
        },
        highlighting: {
          magnetAvailable: {
            name: "stroke",
            args: {
              padding: 4,
              attrs: {
                strokeWidth: 4,
                stroke: "#6a6c8a"
              }
            }
          }
        }
      });
      // 快捷键的使用
      this.graph.bindKey(["meta+c", "ctrl+c"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.copy(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+v", "ctrl+v"], () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({ offset: 32 });
          this.graph.cleanSelection();
          this.graph.select(cells);
        }
        return false;
      });
      // select all
      this.graph.bindKey(["meta+a", "ctrl+a"], () => {
        const nodes = this.graph.getNodes();
        if (nodes) {
          this.graph.select(nodes);
        }
      });
      //delete
      this.graph.bindKey("backspace", () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.removeCells(cells);
        }
      });

      insertCss(`
              @keyframes ant-line {
                to {
                    stroke-dashoffset: -1000
                }
              }
            `);
      // 引入JSON文件
      console.log(testImportJsons.cells);
      // this.graph.fromJSON(testImportJsons);//shape:"image"的时候好用；html的时候无法使用
      // 先画元件后画边，因此需要分成两个forEach
      testImportJsons.cells.forEach(it => {
        if (it.shape != "edge") {
          this.graph.addNode({
            ...it,
            html() {
              return `
                          <div class="parents">
              <img src=${
                it.imageUrl
              } width="50px" height="50px" style="display: block;margin: 0 auto;">
              <p>数量为：1</p>
            </div>
            `;
            }
          });
        }
      });
      testImportJsons.cells.forEach(it => {
         if (it.shape == "edge") {
          this.graph.addEdge({
            ...it,
          });
        }
      })

      this.graph.history.redo();
      this.graph.history.undo();
      // 鼠标移入移出节点
      this.graph.on(
        "node:mouseenter",
        FunctionExt.debounce(() => {
          const container = document.getElementById("containerChart");
          const ports = container.querySelectorAll(".x6-port-body");
          this.showPorts(ports, true);
        }),
        500
      );
      this.graph.on("node:mouseleave", () => {
        console.log("鼠标移出节点");
        const container = document.getElementById("containerChart");
        const ports = container.querySelectorAll(".x6-port-body");
        this.showPorts(ports, false);
      });
      // 需要升级版本才能解决blank的点击问题：npm i @antv/x6@1.34.6
      this.graph.on("blank:click", () => {
        console.log("鼠标点击空白");
        if (this.selectCell) {
          this.selectCell.setProp({
            html: () => {
              // console.log(this.selectCell.getProp().imageUrl);
              return `
              <div class="parents">
                <img src=${
                  this.selectCell.getProp().imageUrl
                } width="50px" height="50px" style="display: block;margin: 0 auto;">
                <p>数量为：1</p>
              </div>
              `;
              // 数量可变
            },
            width: 80,
            height: 80
          });
        }
        this.type = "grid";
      });
      // 单击事件
      this.graph.on("cell:click", ({ cell }) => {
        console.log("鼠标单点击节点");
        this.type = cell.isNode() ? "node" : "edge";
      });
      // 双击事件，设置添加数据在此
      this.graph.on("cell:dblclick", ({ cell }) => {
        console.log("鼠标双击节点");
        // console.log(cell);
        // 对业务数据经行初始化操作(设置业务数据)
        if (cell.data === undefined) {
          cell.setData({
            y: this.test
          });
        }
        // 获取基本全部属性getProp()以及获取业务数据getData()
        console.log(cell.getProp());
        // console.log(cell.getData());
        /* 设置属性(2种方式):删除属性：removeProp()
            cell.setProp('size', { width: 100, height: 30 })
            cell.setProp({size:{width:10}})
        */
        cell.setProp({
          html: () => {
            // console.log(cell.getProp().imageUrl);
            return `
            <div class="parents">
              <img src=${
                cell.getProp().imageUrl
              } width="30px" height="30px" style="display: block;margin: 0 auto;">
              <div style="display: flex;justify-content: space-between;">
                <img src=${cell.getProp().imageUrl} width="30px" height="30px">
                <img src=${cell.getProp().imageUrl} width="30px" height="30px">
              </div>
              <p>数量为：1</p>
            </div>
            `;
            // 数量可变
          },
          width: 80,
          height: 80
        });
        this.type = cell.isNode() ? "node" : "edge";
      });
      // this.graph.on("cell:change:*", ({cell}) => {
      //   console.log(222);
      // })
      this.graph.on("cell:mouseleave", ({ cell }) => {
        console.log("鼠标已出节点");
        cell.setProp({
          html: () => {
            console.log(cell.getProp());
            return `
            <div class="parents">
              <img src=${
                cell.getProp().imageUrl
              } width="50px" height="50px" style="display: block;margin: 0 auto;">
              <p>数量为：1</p>
            </div>
            `;
            // 数量可变
          },
          width: 80,
          height: 80
        });
        this.type = cell.isNode() ? "node" : "edge";
      });

      this.graph.on("selection:changed", args => {
        console.log("鼠标单击更改节点事件");
        args.added.forEach(cell => {
          this.selectCell = cell;
          if (cell.isEdge()) {
            cell.isEdge() && cell.attr("line/strokeDasharray", 5); //虚线蚂蚁线
            cell.addTools([
              {
                name: "vertices",
                args: {
                  padding: 4,
                  attrs: {
                    strokeWidth: 0.1,
                    stroke: "#2d8cf0",
                    fill: "#ffffff"
                  }
                }
              }
            ]);
          }
        });
        args.removed.forEach(cell => {
          cell.isEdge() && cell.attr("line/strokeDasharray", 0); //正常线
          cell.removeTools();
        });
      });
      // 对线条加入快捷删除工具
      // 移入线条的时候
      this.graph.on("edge:mouseenter", ({ edge }) => {
        edge.addTools([
          {
            name: "button-remove",
            args: {
              distance: -30
            }
          }
        ]);
      });
      // 移出线条的时候
      this.graph.on("edge:mouseleave", ({ edge }) => {
        edge.removeTools();
      });
      // 创建面板
      const stencil = new Addon.Stencil({
        title: "流程图",
        target: this.graph,
        stencilGraphWidth: 250, //显示的拓扑图的整体的行宽
        stencilGraphHeight: 180,
        collapsable: true,
        groups: [
          // {
          //   title: "基础流程图",
          //   name: "group1"
          // },
          {
            title: "系统设计图",
            name: "group2",
            graphHeight: Math.ceil(this.svgShape.length / 3) * 75.5, //单组高度
            layoutOptions: {
              rowHeight: 70 //行高
            }
          }
        ],
        layoutOptions: {
          columns: 3, //一行显示几个拓扑图标
          columnWidth: 80, //单个图标宽度
          rowHeight: 55 //单个图标高度
        }
      });
      document.getElementById("stencil").appendChild(stencil.container);
      const imageNodes = this.svgShape.map(item =>
        this.graph.createNode({
          // shape: "image",
          shape: "html",
          width: 50,
          height: 50,
          label: item.label,
          data: {
            num: 1,//组内数量
            imageUrl: item.name,
            group: [],//存储单个或者多个的时候的组内信息
          },
          imageUrl: item.name, //shape: "html"的时候可以省略这句话
          html: () => {
            this.imgUrl = item.name;
            return `
              <img src=${
                item.name == "" ? this.imgUrl : item.name
              } width="50px" height="50px">
            `;
          },
          // ports是加入节点，里面有groups(定义链接桩组)和items(链接桩)结构
          ports: {
            groups: {
              top: {
                position: "top",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                      visibility: "hidden"
                    }
                  }
                }
              },
              right: {
                position: "right",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                      visibility: "hidden"
                    }
                  }
                }
              },
              bottom: {
                position: "bottom",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                      visibility: "hidden"
                    }
                  }
                }
              },
              left: {
                position: "left",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                    style: {
                      visibility: "hidden"
                    }
                  }
                }
              }
            },
            items: [
              {
                group: "top"
              },
              {
                group: "right"
              },
              {
                group: "bottom"
              },
              {
                group: "left"
              }
            ]
          }
        })
      );
      stencil.load(imageNodes, "group2");
    },
    showPorts(ports, show) {
      console.log();
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? "visible" : "hidden";
      }
    },
    // 拖拽生成正方形或者圆形
    startDrag(type, e) {
      startDragToGraph(this.graph, type, e);
    },
    // 删除节点
    deleteNode() {
      const cell = this.graph.getSelectedCells();
      this.graph.removeCells(cell);
      this.type = "grid";
    },
    // 保存png
    saveToPNG() {
      this.$nextTick(() => {
        this.graph.toPNG(
          dataUri => {
            // 下载
            DataUri.downloadDataUri(dataUri, "assets_topo.png");
          },
          {
            backgroundColor: "white",
            padding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50
            },
            quality: 1,
            copyStyles: false
          }
        );
      });
    },
    // 保存为JSON文件
    saveToJson() {
      this.$nextTick(() => {
        const getJson = this.graph.toJSON();
        let data = JSON.stringify(getJson);
        let uri =
          "data:text/csv;charset=utf-8,\ufeff" + encodeURIComponent(data);
        let link = document.createElement("a");
        link.href = uri;
        link.download = "asset_topology.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    },
    // 改变边形状
    changeEdgeType(e) {
      if (e === "normal") {
        this.connectEdgeType = {
          connector: "normal",
          router: { name: "" }
        };
        this.currentArrow = 1;
      } else if (e === "smooth") {
        this.connectEdgeType = {
          connector: "smooth",
          router: { name: "" }
        };
        this.currentArrow = 2;
      } else {
        this.connectEdgeType = {
          connector: "normal",
          router: { name: "manhattan" }
        };
        this.currentArrow = 3;
      }
    }
  },
  mounted() {
    // console.log(this.testImportJson);
    // 引入所有子文件
    this.importAllSVG();
    this.initX6();
    setTimeout(() => {
      this.showTips = true;
    }, 1000);
    setTimeout(() => {
      this.showTips = false;
    }, 5000);
  }
};
</script>
<style lang="less">
@import "../assets/iconfont.css";
@import "./index.less";
.x6-widget-stencil {
  position: relative !important;
  height: 100%;
}
#stencil {
  height: 90%;
}
.parents {
  width: 80px;
  height: 80px;
  border: 1px dashed #000;

  // img{
  //   // width: 100%;
  //   display: flex;
  //   justify-content: space-between;
  // }
  p {
    text-align: center;
  }
}
// #stencil .x6-widget-stencil-group:last-child .x6-graph {
//   height: 1200px !important;
// }
// #stencil .x6-graph-svg {
//   height: 1200px;
// }
</style>
