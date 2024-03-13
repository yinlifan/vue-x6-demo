import '@antv/x6-vue-shape';
import {
  Graph,
  Shape,
  Addon,
  FunctionExt
} from '@antv/x6';
// 拖拽生成四边形或者圆形
export const startDragToGraph = (graph, type, e) => {
  const node =
    type === 'Rect' ?
    graph.createNode({
      width: 100,
      height: 60,
      attrs: {
        label: {
          // text里面加入描述，如：正方形节点
          text: '',
          fill: '#000000',
          fontSize: 14,
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
        body: {
          stroke: '#000000',
          strokeWidth: 1,
          fill: '#ffffff',
          strokeDasharray: "3 0", //svg画虚线的属性stroke-dasharray:"3 2",3和2分别表示画的长度和间隙的长度
        }
      },
      ports: ports
    }) :
    type === 'Circle' ? graph.createNode({
      shape: 'ellipse',
      width: 100,
      height: 100,
      attrs: {
        label: {
          text: '',
          fill: '#000000',
          fontSize: 14,
          textWrap: {
            width: -20,
            height: -10,
            ellipsis: true,
          },
        },
        body: {
          stroke: '#000000',
          strokeWidth: 1,
          fill: '#ffffff',
        }
      },
      ports: ports
    }) :
    type === 'polygon' ? graph.createNode({
      shape: 'polygon',
      x: 40,
      y: 40,
      width: 120,
      height: 120,
      attrs: {
        label: {
          text: '',
          fill: '#000000',
          fontSize: 14,
          textWrap: {
            width: -50,
            height: '70%',
            ellipsis: true,
          },
        },
        body: {
          fill: '#ffffff',
          stroke: '#000000',
          refPoints: '0,10 10,0 20,10 10,20',
          strokeWidth: 1,
        },
      },
      ports: ports
    }) :
    graph.createNode({
      width: 100,
      height: 1,
      attrs: {
        label: {
          // text里面加入描述，如：正方形节点
          text: '',
          fill: '#000000',
          fontSize: 14,
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
        body: {
          stroke: '#000000',
          strokeWidth: 0.5,
          fill: '#000000',
          strokeDasharray: "1 0", //svg画虚线的属性stroke-dasharray:"3 2",3和2分别表示画的长度和间隙的长度
        }
      },
      ports: {
        groups: {
          // 输入链接桩群组定义
          // 输出链接桩群组定义
          left: {
            position: 'left',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
          right: {
            position: 'right',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#2D8CF0',
                strokeWidth: 2,
                fill: '#fff',
              },
            },
          },
        },
        items: [
          {
            id: 'port3',
            group: 'left',
          },
          {
            id: 'port4',
            group: 'right',
          }
        ],
      }

    });
  const dnd = new Addon.Dnd({
    target: graph
  })
  dnd.start(node, e)
}
const ports = {
  groups: {
    // 输入链接桩群组定义
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#2D8CF0',
          strokeWidth: 2,
          fill: '#fff',
        },
      },
    },
    // 输出链接桩群组定义
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#2D8CF0',
          strokeWidth: 2,
          fill: '#fff',
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#2D8CF0',
          strokeWidth: 2,
          fill: '#fff',
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#2D8CF0',
          strokeWidth: 2,
          fill: '#fff',
        },
      },
    },
  },
  items: [{
      id: 'port1',
      group: 'top',
    },
    {
      id: 'port2',
      group: 'bottom',
    },
    {
      id: 'port3',
      group: 'left',
    },
    {
      id: 'port4',
      group: 'right',
    }
  ],
}
