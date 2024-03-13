<template>
  <div class="drawer_container">
    <div v-if="drawerType === 'grid'">
      <div class="drawer_title">画布背景设置</div>
      <div class="drawer_wrap">
        <Form label-position="left" :label-width="85">
          <FormItem label="是否显示网格" :label-width="100">
            <i-switch v-model="showGrid" @on-change="changeGrid" />
          </FormItem>
          <div v-show="showGrid">
            <FormItem label="网格类型">
              <RadioGroup v-model="grid.type" @on-change="changeGridType">
                <Radio
                  v-for="item in gridTypeList"
                  :label="item.value"
                  :key="item.value"
                >
                  <span>{{ item.label }}</span>
                </Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="网格大小">
              <Slider
                v-model="grid.size"
                :min="0"
                :max="30"
                @on-change="changeGrid"
              ></Slider>
            </FormItem>
            <FormItem label="网格颜色">
              <ColorPicker v-model="grid.args.color" @on-change="changeGrid" />
            </FormItem>
            <FormItem label="网格线宽度">
              <Slider
                v-model="grid.args.thickness"
                :min="0"
                :max="20"
                @on-change="changeGrid"
              ></Slider>
            </FormItem>
          </div>
        </Form>
      </div>
    </div>
    <div v-if="drawerType === 'node'">
      <div class="drawer_title">设备设置</div>
      <div class="drawer_wrap">
        <Form label-position="left" :label-width="80">
          <FormItem label="设备文本">
            <Input
              v-model="drawerNode.nodeText"
              @on-change="changeNodeText"
            ></Input>
          </FormItem>
          <FormItem label="设备背景">
            <ColorPicker v-model="drawerNode.fill" @on-change="changeFill" />
          </FormItem>
          <FormItem label="字体大小">
            <Slider
              v-model="drawerNode.fontSize"
              :min="10"
              :max="20"
              @on-change="changefontSize"
            ></Slider>
          </FormItem>
          <FormItem label="透明度">
            <Slider
              v-model="drawerNode.opacity"
              :min="0"
              :max="1"
              :step="0.05"
              @on-change="changeItemOpacity"
            ></Slider>
          </FormItem>
          <FormItem label="字体颜色">
            <ColorPicker
              v-model="drawerNode.fontFill"
              @on-change="changeFontFill"
            />
          </FormItem>
          <FormItem label="z-Index">
            <Slider
              v-model="drawerNode.zIndex"
              :min="0"
              :max="100"
              @on-change="changeStrokeWidth"
            ></Slider>
          </FormItem>
          <FormItem label="边框颜色">
            <ColorPicker
              v-model="drawerNode.stroke"
              @on-change="changeStroke"
            />
          </FormItem>
          <!-- 需要更改 -->
          <FormItem label="边框类型" v-if="selectCell.shape!='html'">
            <RadioGroup @on-change="changeBorder" v-model="drawerNode.strokeDasharray">
              <Radio
                v-for="item in borderTypeList"
                :label="item.value"
                :key="item.value"
              >
                <span>{{ item.label }}</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="功能">
            <Button type="primary" icon="md-trending-up" @click="toTopZIndex"
              >置顶</Button
            >
            <Button
              type="error"
              class="margin-left-10"
              icon="md-trash"
              @click="deleteNode"
              >删除</Button
            >
          </FormItem>
        </Form>
      </div>
    </div>
    <div v-if="drawerType === 'edge'">
      <div class="drawer_title">线条设置</div>
      <div class="drawer_wrap">
        <Form label-position="left" :label-width="80">
          <FormItem label="线条文本">
            <Input
              v-model="drawerEdge.EdgeText"
              @on-change="changeEdgeText"
            ></Input>
          </FormItem>
          <FormItem label="线条宽度">
            <Slider
              v-model="drawerEdge.edgeWidth"
              :min="1"
              :max="15"
              @on-change="changeEdgeWidth"
            ></Slider>
          </FormItem>
          <FormItem label="z-Index">
            <Slider
              v-model="drawerNode.zIndex"
              :min="0"
              :max="100"
              @on-change="changeStrokeWidth"
            ></Slider>
          </FormItem>
          <FormItem label="线条类型">
            <RadioGroup @on-change="changeLineBorder" v-model="drawerEdge.strokeDasharray">
              <Radio
                v-for="item in lineTypeList"
                :label="item.value"
                :key="item.value"
              >
                <span>{{ item.label }}</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="线条颜色">
            <ColorPicker
              v-model="drawerEdge.edgeColor"
              @on-change="changeEdgeColor"
            />
          </FormItem>
          <FormItem label="功能">
            <Button type="primary" icon="md-trending-up" @click="toTopZIndex"
              >置顶</Button
            >
            <Button
              type="error"
              class="margin-left-10"
              icon="md-trash"
              @click="deleteNode"
              >删除</Button
            >
          </FormItem>
        </Form>
      </div>
    </div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "RightDrawer",
  data() {
    return {
      gridTypeList: [
        {
          label: "四边网格",
          value: "mesh"
        },
        {
          label: "点状网格",
          value: "dot"
        }
      ],
      borderTypeList: [
        {
          label: "实线",
          value: "3 0"
        },
        {
          label: "虚线",
          value: "3 3"
        }
      ],
      lineTypeList: [
        {
          label: "实线",
          value: "3 0"
        },
        {
          label: "虚线",
          value: "3 3"
        }
      ],
      showGrid: true,
      drawerNode: {
        fill: "",
        nodeText: "",
        fontSize: null,
        fontFill: "",
        zIndex: null,
        stroke: "",
        opacity: null,
        strokeDasharray: "9 1"
      },
      drawerEdge: {
        EdgeText: "",
        edgeWidth: null,
        edgeColor: "",
        strokeDasharray: "9 0"
      }
    };
  },
  props: {
    drawerType: {
      type: String
    },
    selectCell: {
      type: String | Object
    },
    graph: {
      type: String | Object
    },
    grid: {
      type: Object
    }
  },
  created() {},
  mounted() {},
  watch: {
    selectCell: {
      handler(val) {
        if (val) {
          if (val.isNode()) {
            console.log(this.drawerType);
            //设备
            this.drawerNode.fill = val.store.data.attrs.body
              ? val.store.data.attrs.body.fill
              : "";
            this.drawerNode.nodeText = val.store.data.attrs.label
              ? val.store.data.attrs.label.text
              : "";
            this.drawerNode.fontFill = val.store.data.attrs.label
              ? val.store.data.attrs.label.fill
              : "";
            this.drawerNode.fontSize = Number(
              val.store.data.attrs.label
                ? val.store.data.attrs.label.fontSize
                : ""
            );
            // console.log(val.store.data.shape != "html");
            // console.log(val.store.data);
            console.log(this.selectCell);
            if (val.store.data.shape != "html") {
              if (!val.store.data.attrs.body.opacity) {
                val.store.data.attrs.body.opacity = 1;
              }
              this.drawerNode.opacity = Number(
                val.store.data.attrs.body.opacity
              );
            } else {
              console.log(this.drawerNode);
              console.log(document.getElementById(
                val.store.data.id
              ));
              if(!document.getElementById(
                val.store.data.id
              )){
                return this.drawerNode.opacity = null
              }
              this.drawerNode.opacity = val.store.data.data.opacity;
              document.getElementById(
                val.store.data.id
              ).style.opacity = this.drawerNode.opacity;
            }
            this.drawerNode.zIndex = Number(
              val.store.data.attrs.body ? val.store.data.zIndex : ""
            );
            this.drawerNode.stroke = val.store.data.attrs.body
              ? val.store.data.attrs.body.stroke
              : "";
          } else {
            //边
            this.drawerEdge.EdgeText = val.store.data.labels
              ? val.store.data.labels[0].text
              : "";
            this.drawerEdge.edgeWidth = Number(val.store.data.zIndex);
            this.drawerEdge.edgeColor = val.store.data.attrs.line.stroke;
          }
        }
      },
      immediate: true,
      deep: false
    }
  },
  methods: {
    // 改变线的样式
    changeLineBorder(e){
      console.log(this.selectCell);
      console.log(e);
    this.selectCell.setAttrs({
        line:{
          strokeDasharray:e
        }
      })
},
    // 改变边框样式
    changeBorder(e){
      console.log(e);
      console.log(this.selectCell);
      this.selectCell.setAttrs({
        body:{
          strokeDasharray:e
        }
      })
    },
    // 网格设置
    changeGrid() {
      this.showGrid ? this.graph.showGrid() : this.graph.hideGrid();
    },
    changeGridType(e) {
      this.grid.type = e;
      this.changeGrid();
    },
    changeGrid() {
      this.graph.drawGrid({
        ...this.grid
      });
    },
    // 设备设置
    changeStrokeWidth(val) {
      // console.log(val);
      this.selectCell.setZIndex(val);
      // this.selectCell.attr("body/strokeWidth", val);//zIndex换成strokeWidth，就是设置边框宽度
    },
    changefontSize(val) {
      this.selectCell.attr("label/fontSize", val);
    },
    changeItemOpacity(val) {
      console.log(this.selectCell);
      if (this.selectCell.shape != "html") {
        this.selectCell.attr("body/opacity", val);
      } else {
        this.selectCell.data.opacity = val
        document.getElementById(this.selectCell.id).style.opacity = val;
      }
    },
    changeNodeText() {
      this.selectCell.attr("label/text", this.drawerNode.nodeText);
    },
    changeStroke(val) {
      this.drawerNode.stroke = val;
      this.selectCell.attr("body/stroke", this.drawerNode.stroke);
    },
    changeFontFill(val) {
      this.drawerNode.fontFill = val;
      this.selectCell.attr("label/fill", this.drawerNode.fontFill);
    },
    changeFill(val) {
      this.drawerNode.fill = val;
      this.selectCell.attr("body/fill", val);
    },
    // 边设置
    changeEdgeText() {
      console.log(this.drawerEdge.EdgeText);
      this.selectCell.setLabels([
        { attrs: { label: { text: this.drawerEdge.EdgeText } } }
      ]);
    },
    changeEdgeWidth(val) {
      this.drawerEdge.edgeWidth = val;
      this.selectCell.attr("line/strokeWidth", this.drawerEdge.edgeWidth);
    },
    changeEdgeColor(val) {
      this.drawerEdge.stroke = val;
      this.selectCell.attr("line/stroke", this.drawerEdge.stroke);
    },
    // 置顶
    toTopZIndex() {
      this.selectCell.toFront();
    },
    // 删除
    deleteNode() {
      this.$emit("deleteNode");
    }
  }
};
</script>

<style lang="less" scoped>
.drawer_container {
  max-width: 290px;
  min-width: 290px;
  .drawer_title {
    border-bottom: 1px solid #e8eaec;
    box-sizing: border-box;
    padding: 14px 16px;
    color: #333;
    font-size: 16px;
  }
  .drawer_wrap {
    box-sizing: border-box;
    padding: 20px 10px 20px 20px;
  }
}
</style>
