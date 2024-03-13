<template>
  <div class="container_warp">
    <!-- 顶部栏，基本工具在toolBars里面 -->
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
          <div class="btn" title="线段" @click="initLine($event, true)">
            <!-- @mousedown="startDrag('line', $event)" -->
            <i class="iconfont icon-fengexian"></i>
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
      graph: {},
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
      oTopoList: [],
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
      oSvgShape: [],
      imgUrl: "",
      test: 1, //测试数据，等会删除
      node: null,
      edge: null,
      flag: false
    };
  },
  components: {
    RightDrawer,
    toolBars,
    LeftDrawer
  },
  methods: {
    // 批量引入svg文件
    importAllSVG() {
      const req = require.context("@/assets/topo", true, /\.svg$/);
      const requireAll = requireContext =>
        requireContext.keys().map(requireContext);
      this.topoList = requireAll(req);
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
    importOrginSVG() {
      const req = require.context("@/assets/orgin", true, /\.svg$/);
      const requireAll = requireContext =>
        requireContext.keys().map(requireContext);
      this.oTopoList = requireAll(req);
      // 初始化
      this.oTopoList.forEach((it, idx) => {
        this.oSvgShape.push({
          name: "", //在面板上显示图标
          type: "", //分类
          label: "" //显示文本
        });
        this.oSvgShape[idx].name = it;
      });
    },

    // /////////划线/////////////
    // 点击之后初始化
    initLine(pos, f) {
      console.log(pos);
      if(f){
        this.flag = !this.flag;
      }else{
        this.node = this.graph.addNode({
          shape: "circle",
          width: 10,
          height: 10,
          ...pos,
          attrs: {
            body: {
              strokeWidth: 1,
              stroke: "#5F95FF",
              fill: "#EFF4FF"
            }
          }
        });
        this.edge = this.graph.addEdge({
          source: this.node,
          target: pos,
          // ports: {
          //   groups: {
          //     top: {
          //       position: "top",
          //       attrs: {
          //         circle: {
          //           r: 4,
          //           magnet: true,
          //           stroke: "#5F95FF",
          //           strokeWidth: 1,
          //           fill: "#fff",
          //           style: {
          //             visibility: "hidden"
          //           }
          //         }
          //       }
          //     },
          //     right: {
          //       position: "right",
          //       attrs: {
          //         circle: {
          //           r: 4,
          //           magnet: true,
          //           stroke: "#5F95FF",
          //           strokeWidth: 1,
          //           fill: "#fff",
          //           style: {
          //             visibility: "hidden"
          //           }
          //         }
          //       }
          //     },
          //     bottom: {
          //       position: "bottom",
          //       attrs: {
          //         circle: {
          //           r: 4,
          //           magnet: true,
          //           stroke: "#5F95FF",
          //           strokeWidth: 1,
          //           fill: "#fff",
          //           style: {
          //             visibility: "hidden"
          //           }
          //         }
          //       }
          //     },
          //     left: {
          //       position: "left",
          //       attrs: {
          //         circle: {
          //           r: 4,
          //           magnet: true,
          //           stroke: "#5F95FF",
          //           strokeWidth: 1,
          //           fill: "#fff",
          //           style: {
          //             visibility: "hidden"
          //           }
          //         }
          //       }
          //     }
          //   },
          //   items: [
          //     {
          //       group: "top"
          //     },
          //     {
          //       group: "right"
          //     },
          //     {
          //       group: "bottom"
          //     },
          //     {
          //       group: "left"
          //     }
          //   ]
          // },

        //           resizing: {
        //   //调整节点宽高
        //   enabled: true,
        //   orthogonal: false,
        //   allowReverse: false,
        //   // minHeight: 1,
        //   // maxHeight: 1
        // },

        //   rotating: true, //旋转
        //   snapline: true, //对齐线，默认禁用。
          attrs: {
            line: {
              targetMarker: null,
              stroke: "#5F95FF",
              strokeWidth: 2,
              strokeDasharray: "2 0"
            }
          },
        });

      }
    },
    addVertices(pos) {
      if (this.edge) {
        this.edge.appendVertex(pos);
      }
    },
    onMouseMove(e) {
      if (this.edge) {
        const pos = this.graph.clientToLocal(e.clientX, e.clientY);
        this.edge.setTarget(pos);
      }
    },
    print() {
      if (this.edge) {
        const view = this.graph.findViewByCell(this.edge);
        console.log(view.path.serialize());
      }
    },
    finish(closed) {
      console.log(closed);
      if (this.node && this.edge) {
        const vertices = this.edge.getVertices();
        if (closed) {
          if (vertices.length >= 2) {
            const center = this.node.getBBox().center;
            this.edge.setSource(center);
            this.edge.setTarget(center);
            this.graph.removeNode(this.node);
            this.node = null;
            this.print();
          } else {
            this.graph.removeCells([this.node, this.edge]);
            this.node = null;
            this.edge = null;
          }
        } else {
          if (vertices.length >= 1) {
            const center = this.node.getBBox().center;
            this.edge.setSource(center);
            this.edge.setTarget(vertices[vertices.length - 1]);
            this.graph.removeNode(this.node);
            this.node = null;
            this.print();
          } else {
            this.graph.removeCells([this.node, this.edge]);
            this.node = null;
            this.edge = null;
          }
        }
        document
          .getElementById("containerChart")
          .removeEventListener("mousemove", this.onMouseMove);
      }
    },
    // /////////////////////

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
          orthogonal: false,
          allowReverse: false,
          // minHeight: 1,
          // maxHeight: 1
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
              // opacity: 1,
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
      // 创建画板上的图形
      // 先画元件后画边，因此需要分成两个forEach
      testImportJsons.cells.forEach(it => {
        if (it.shape != "edge") {
          this.graph.addNode({
            ...it,
            html(c) {
              if (it.data.num != 1) {
                return `
                  <div id="${c.id}" class="parents">
                    <img src=${it.imageUrl} width="50px" height="50px" style="display: block;margin: 0 auto;">
                    <p>数量为：${it.data.num}</p>
                  </div>
                `;
              } else {
                // console.log(1);
                return `
                  <div id="${c.id}" style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;">
                    <img src=${it.imageUrl} width="80%" height="80%">
                  </div>
                `;
              }
            }
          });
        }
      });
      testImportJsons.cells.forEach(it => {
        if (it.shape == "edge") {
          this.graph.addEdge({
            ...it
          });
        }
      });

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
        const container = document.getElementById("containerChart");
        const ports = container.querySelectorAll(".x6-port-body");
        this.showPorts(ports, false);
      });
      // 需要升级版本才能解决blank的点击问题：npm i @antv/x6@1.34.6
      this.graph.on("blank:click", ({ x, y }) => {
        if (!this.flag) {
          // console.log("鼠标点击空白");
          if (this.selectCell) {
            this.selectCell.setProp({
              html: c => {
                console.log(c.data);
                if (
                  c.getProp().imageUrl ==
                  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE3MCIgc3R5bGU9ImZsb2F0OiBsZWZ0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHJlY3QgeD0iMTAiIHk9IjUwIiByeD0iMTUiIHdpZHRoPSIyNjAiIGhlaWdodD0iMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsgZmlsbC1vcGFjaXR5OiAwLjY1OyBzdHJva2U6ICMwMDA7IHN0cm9rZS13aWR0aDogMTA7IHJ5OiAxNTsiLz4KICAgIDx0ZXh0IHg9IjgzIiB5PSIxMTUiIGZpbGw9IiMwMDAiIGZvbnQtc2l6ZT0iNjAiIHN0eWxlPSJmb250LWZhbWlseTogQmx1ZSBIaWdod2F5LCBBcmlhbCBCbGFjaywgc2Fucy1zZXJpZjsgc3Ryb2tlOiBibGFjazsgc3Ryb2tlLXdpZHRoOiAyOyI+5rWL54K5PC90ZXh0Pgo8L3N2Zz4K"
                ) {
                  console.log(6767);
                  return `
                    <div style="border: 1px solid;width: 100%;">
                        <ul style="border-bottom: 1px solid;height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                            <li style="color: #A5D63F;">测点名称</li>
                            <li style="color: #FFC300;">测点值</li>
                            <li style="color: #00BAAD;">单位</li>
                        </ul>
                        <ul style="height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                            <li style="color: #A5D63F;">电压</li>
                            <li style="color: #FFC300;">100</li>
                            <li style="color: #00BAAD;">kV</li>
                        </ul>
                        <ul style="height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                            <li style="color: #A5D63F;">电流</li>
                            <li style="color: #FFC300;">336</li>
                            <li style="color: #00BAAD;">A</li>
                        </ul>
                    </div>
                  `;
                }

                if (this.selectCell.getProp().data.num != 1) {
                  return `
                  <div id="${c.id}" class="parents">
                    <img src=${
                      this.selectCell.getProp().imageUrl
                    } width="50px" height="50px" style="display: block;margin: 0 auto;">
                    <p>数量为：${cell.getProp().data.num}</p>
                  </div>
                  `;
                } else {
                  return `
                    <div id="${
                      c.id
                    }" style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;">
                      <img src=${
                        this.selectCell.getProp().imageUrl
                      } width="80%" height="80%">
                    </div>
                  `;
                }
                // 数量可变
              }
            });
          }
          this.type = "grid";
        } else {
          // console.log({ x, y });
          this.initLine({ x, y },false);
          document
            .getElementById("containerChart")
            .addEventListener("mousemove", this.onMouseMove);
        }
      });
      // 单击事件
      this.graph.on("cell:click", ({ cell }) => {
        console.log(cell);
        // console.log(document.getElementById(cell.id));
        cell.removeTools(); //移除工具
        this.type = cell.isNode() ? "node" : "edge";
      });
      // 右击事件，设置添加数据在此
      this.graph.on("cell:contextmenu", ({ cell }) => {
        // console.log(!this.flag);
        if(!this.flag){
          // console.log("鼠标右击节点");
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
            html: c => {
              if (
                c.getProp().imageUrl ==
                "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE3MCIgc3R5bGU9ImZsb2F0OiBsZWZ0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHJlY3QgeD0iMTAiIHk9IjUwIiByeD0iMTUiIHdpZHRoPSIyNjAiIGhlaWdodD0iMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsgZmlsbC1vcGFjaXR5OiAwLjY1OyBzdHJva2U6ICMwMDA7IHN0cm9rZS13aWR0aDogMTA7IHJ5OiAxNTsiLz4KICAgIDx0ZXh0IHg9IjgzIiB5PSIxMTUiIGZpbGw9IiMwMDAiIGZvbnQtc2l6ZT0iNjAiIHN0eWxlPSJmb250LWZhbWlseTogQmx1ZSBIaWdod2F5LCBBcmlhbCBCbGFjaywgc2Fucy1zZXJpZjsgc3Ryb2tlOiBibGFjazsgc3Ryb2tlLXdpZHRoOiAyOyI+5rWL54K5PC90ZXh0Pgo8L3N2Zz4K"
              ) {
                // console.log(6767);
                return `
                  <div style="border: 1px solid;width: 100%;">
                      <ul style="border-bottom: 1px solid;height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                          <li style="color: #A5D63F;">测点名称</li>
                          <li style="color: #FFC300;">测点值</li>
                          <li style="color: #00BAAD;">单位</li>
                      </ul>
                      <ul style="height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                          <li style="color: #A5D63F;">电压</li>
                          <li style="color: #FFC300;">100</li>
                          <li style="color: #00BAAD;">kV</li>
                      </ul>
                      <ul style="height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                          <li style="color: #A5D63F;">电流</li>
                          <li style="color: #FFC300;">336</li>
                          <li style="color: #00BAAD;">A</li>
                      </ul>
                  </div>
                `;
              }

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
        }
      });
      this.graph.on("cell:mouseleave", ({ cell }) => {
        // console.log(1);
        // 需要改变，修改
        cell.setProp({
          html: c => {
            console.log(cell.getProp());
            if (
              c.getProp().imageUrl ==
              "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE3MCIgc3R5bGU9ImZsb2F0OiBsZWZ0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHJlY3QgeD0iMTAiIHk9IjUwIiByeD0iMTUiIHdpZHRoPSIyNjAiIGhlaWdodD0iMTAwIiBzdHlsZT0iZmlsbDogI2ZmZjsgZmlsbC1vcGFjaXR5OiAwLjY1OyBzdHJva2U6ICMwMDA7IHN0cm9rZS13aWR0aDogMTA7IHJ5OiAxNTsiLz4KICAgIDx0ZXh0IHg9IjgzIiB5PSIxMTUiIGZpbGw9IiMwMDAiIGZvbnQtc2l6ZT0iNjAiIHN0eWxlPSJmb250LWZhbWlseTogQmx1ZSBIaWdod2F5LCBBcmlhbCBCbGFjaywgc2Fucy1zZXJpZjsgc3Ryb2tlOiBibGFjazsgc3Ryb2tlLXdpZHRoOiAyOyI+5rWL54K5PC90ZXh0Pgo8L3N2Zz4K"
            ) {
              console.log(6767);
              return `
                <div style="border: 1px solid;width: 100%;">
                    <ul style="border-bottom: 1px solid;height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                        <li style="color: #A5D63F;">测点名称</li>
                        <li style="color: #FFC300;">测点值</li>
                        <li style="color: #00BAAD;">单位</li>
                    </ul>
                    <ul style="height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                        <li style="color: #A5D63F;">电压</li>
                        <li style="color: #FFC300;">100</li>
                        <li style="color: #00BAAD;">kV</li>
                    </ul>
                    <ul style="height: auto;list-style: none;padding: 0;margin: 0;display: flex;justify-content: space-between;">
                        <li style="color: #A5D63F;">电流</li>
                        <li style="color: #FFC300;">336</li>
                        <li style="color: #00BAAD;">A</li>
                    </ul>
                </div>
              `;
            }
            if (cell.getProp().data.num != 1) {
              return `
              <div id="${c.id}" class="parents">
                <img src=${
                  cell.getProp().imageUrl
                } width="80%" height="80%" style="display: block;margin: 0 auto;">
                <p>数量为：${cell.getProp().data.num}</p>
              </div>
              `;
            } else {
              return `
                <div id="${
                  c.id
                }" style="width: 100%;height: 100%;display: flex;justify-content: center;align-items: center;">
                  <img src=${cell.getProp().imageUrl} width="80%" height="80%">
                </div>
              `;
            }
            // 数量可变
          }
        });
        // console.log(cell);
        cell.removeTools();
        this.type = cell.isNode() ? "node" : "edge";
      });
      // 移入cell，增加删除按钮
      this.graph.on("cell:mouseenter", ({ cell }) => {
        console.log(cell);
        if (cell.isNode()) {
          cell.addTools([
            {
              name: "button-remove",
              args: {
                x: 0,
                y: 0,
                offset: { x: 15, y: 15 }
              }
            }
          ]);
        }
      });
      this.graph.on("selection:changed", args => {
        // console.log("鼠标单击更改节点事件");
        args.added.forEach(cell => {
          this.selectCell = cell;
          if (cell.isEdge()) {
            // cell.isEdge() && cell.attr("line/strokeDasharray", 0); //虚线蚂蚁线
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
          // cell.isEdge() && cell.attr("line/strokeDasharray", 0); //正常线
          cell.removeTools();
        });
      });
      // this.graph.on("blank:dblclick", ({ x, y }) => {
      //   init({ x, y })
      //   this.graph.addEventListener('mousemove', onMouseMove)
      // })
      // 对线条加入快捷删除工具
      // 移入线条的时候
      this.graph.on("edge:mouseenter", ({ edge }) => {
        edge.addTools([
          {
            name: "button-remove",
            args: {
              distance: -60
            }
          }
        ]);
      });
      // 移出线条的时候
      this.graph.on("edge:mouseleave", ({ edge }) => {
        // edge.clearHover()
        edge.removeTools();
      });
      this.graph.on("edge:click", ({ x, y }) => {
        if(this.flag){
          const nodes = this.graph.getNodesFromPoint(x, y);
          if (nodes.length && nodes[0] === this.node) {
            this.finish(true);
          } else {
            this.addVertices({ x, y });
          }
        }
      });
      this.graph.on('edge:contextmenu', () => {
        if(this.flag){
          this.finish(false)
        }
      })

      // 创建面板
      const stencil = new Addon.Stencil({
        title: "控制面板",
        target: this.graph,
        stencilGraphWidth: 250, //显示的拓扑图的整体的行宽
        stencilGraphHeight: 180,
        collapsable: true,
        groups: [
          {
            title: "自定义控件",
            name: "group1"
          },
          {
            title: "系统元件图",
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
            num: 1, //组内数量
            imageUrl: item.name,
            group: [], //存储单个或者多个的时候的组内信息
            opacity: 1
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
      const r1 = this.oSvgShape.map(item =>
        this.graph.createNode({
          // shape: "image",
          shape: "html",
          width: 50,
          height: 50,
          label: item.label,
          data: {
            num: 1, //组内数量
            imageUrl: item.name,
            group: [], //存储单个或者多个的时候的组内信息
            opacity: 1
          },
          imageUrl: item.name, //shape: "html"的时候可以省略这句话
          html: c => {
            // console.log(c.getProp());
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

      stencil.load(r1, "group1");
      stencil.load(imageNodes, "group2");
      // stencil.load(r1, "group1");
    },
    showPorts(ports, show) {
      // console.log();
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
    // 引入所有子文件
    this.importAllSVG();
    this.importOrginSVG();
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
@import "../assets/iconfont/iconfont/iconfont.css";
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
