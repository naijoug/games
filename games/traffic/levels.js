(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.TrafficLevels=f();})(globalThis,function(){return [
  {
    "id": "traffic-01",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "h",
        "length": 2,
        "x": 3,
        "y": 0
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "C",
        "delta": 2
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-02",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 2
      },
      {
        "id": "C",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 0
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 3
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": 1
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-03",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 4
      },
      {
        "id": "C",
        "axis": "v",
        "length": 3,
        "x": 5,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "C",
        "delta": 3
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-04",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 3,
        "x": 3,
        "y": 0
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 1
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 4
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": 3
      },
      {
        "id": "C",
        "delta": -1
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-05",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 0
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "C",
        "delta": -1
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-06",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 3,
        "x": 5,
        "y": 0
      },
      {
        "id": "C",
        "axis": "h",
        "length": 2,
        "x": 0,
        "y": 0
      },
      {
        "id": "D",
        "axis": "v",
        "length": 3,
        "x": 3,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": 3
      },
      {
        "id": "D",
        "delta": 3
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-07",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 2
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 4
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      },
      {
        "id": "E",
        "axis": "h",
        "length": 2,
        "x": 0,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": -2
      },
      {
        "id": "D",
        "delta": -1
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-08",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 4
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 1
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      },
      {
        "id": "E",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 0
      },
      {
        "id": "F",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 4
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": -1
      },
      {
        "id": "C",
        "delta": -1
      },
      {
        "id": "D",
        "delta": 2
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-09",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 0
      },
      {
        "id": "C",
        "axis": "h",
        "length": 2,
        "x": 3,
        "y": 0
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      },
      {
        "id": "E",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 3
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "C",
        "delta": -3
      },
      {
        "id": "D",
        "delta": -1
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-10",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 3,
        "x": 5,
        "y": 0
      },
      {
        "id": "C",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 4
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 2
      },
      {
        "id": "E",
        "axis": "h",
        "length": 2,
        "x": 0,
        "y": 4
      },
      {
        "id": "F",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": 3
      },
      {
        "id": "F",
        "delta": -1
      },
      {
        "id": "D",
        "delta": -2
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-11",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 4
      },
      {
        "id": "C",
        "axis": "v",
        "length": 3,
        "x": 3,
        "y": 0
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 3
      },
      {
        "id": "E",
        "axis": "v",
        "length": 3,
        "x": 5,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": 2
      },
      {
        "id": "C",
        "delta": 3
      },
      {
        "id": "A",
        "delta": 2
      },
      {
        "id": "D",
        "delta": -3
      },
      {
        "id": "A",
        "delta": -2
      },
      {
        "id": "C",
        "delta": -3
      },
      {
        "id": "B",
        "delta": -4
      },
      {
        "id": "C",
        "delta": 3
      },
      {
        "id": "E",
        "delta": 3
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-12",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "h",
        "length": 2,
        "x": 3,
        "y": 4
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 0
      },
      {
        "id": "D",
        "axis": "h",
        "length": 2,
        "x": 0,
        "y": 4
      },
      {
        "id": "E",
        "axis": "v",
        "length": 3,
        "x": 3,
        "y": 0
      },
      {
        "id": "F",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "B",
        "delta": 1
      },
      {
        "id": "E",
        "delta": 3
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-13",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 3,
        "x": 5,
        "y": 0
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 4
      },
      {
        "id": "D",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 0
      },
      {
        "id": "E",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 2
      },
      {
        "id": "F",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 4
      },
      {
        "id": "G",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 4
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "D",
        "delta": -2
      },
      {
        "id": "E",
        "delta": -2
      },
      {
        "id": "A",
        "delta": 2
      },
      {
        "id": "C",
        "delta": -3
      },
      {
        "id": "G",
        "delta": -2
      },
      {
        "id": "F",
        "delta": -2
      },
      {
        "id": "B",
        "delta": 3
      },
      {
        "id": "A",
        "delta": 2
      }
    ]
  },
  {
    "id": "traffic-14",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 4
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 0
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      },
      {
        "id": "E",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 4
      },
      {
        "id": "F",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 0
      },
      {
        "id": "G",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 1
      },
      {
        "id": "H",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "E",
        "delta": -1
      },
      {
        "id": "D",
        "delta": 2
      },
      {
        "id": "A",
        "delta": 2
      },
      {
        "id": "C",
        "delta": 1
      },
      {
        "id": "H",
        "delta": -2
      },
      {
        "id": "F",
        "delta": -2
      },
      {
        "id": "G",
        "delta": -1
      },
      {
        "id": "A",
        "delta": 2
      }
    ]
  },
  {
    "id": "traffic-15",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 1
      },
      {
        "id": "C",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 2
      },
      {
        "id": "D",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 0
      },
      {
        "id": "E",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 0
      },
      {
        "id": "F",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 4
      },
      {
        "id": "G",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 4
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "E",
        "delta": -2
      },
      {
        "id": "D",
        "delta": -2
      },
      {
        "id": "C",
        "delta": -2
      },
      {
        "id": "F",
        "delta": -1
      },
      {
        "id": "B",
        "delta": 2
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-16",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 0
      },
      {
        "id": "C",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 4
      },
      {
        "id": "D",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 4
      },
      {
        "id": "E",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 2
      },
      {
        "id": "F",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 4
      },
      {
        "id": "G",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 0
      },
      {
        "id": "H",
        "axis": "h",
        "length": 2,
        "x": 3,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "A",
        "delta": 2
      },
      {
        "id": "D",
        "delta": -2
      },
      {
        "id": "C",
        "delta": -2
      },
      {
        "id": "F",
        "delta": -2
      },
      {
        "id": "E",
        "delta": 1
      },
      {
        "id": "A",
        "delta": 2
      }
    ]
  },
  {
    "id": "traffic-17",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 3
      },
      {
        "id": "C",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 0
      },
      {
        "id": "D",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 0
      },
      {
        "id": "E",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 2
      },
      {
        "id": "F",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 2
      },
      {
        "id": "G",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 4
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "D",
        "delta": -1
      },
      {
        "id": "C",
        "delta": -1
      },
      {
        "id": "E",
        "delta": -2
      },
      {
        "id": "F",
        "delta": 1
      },
      {
        "id": "A",
        "delta": 4
      }
    ]
  },
  {
    "id": "traffic-18",
    "vehicles": [
      {
        "id": "A",
        "x": 0,
        "y": 2,
        "axis": "h",
        "length": 2
      },
      {
        "id": "B",
        "axis": "v",
        "length": 2,
        "x": 5,
        "y": 2
      },
      {
        "id": "C",
        "axis": "h",
        "length": 3,
        "x": 1,
        "y": 0
      },
      {
        "id": "D",
        "axis": "h",
        "length": 2,
        "x": 2,
        "y": 4
      },
      {
        "id": "E",
        "axis": "v",
        "length": 2,
        "x": 1,
        "y": 4
      },
      {
        "id": "F",
        "axis": "v",
        "length": 2,
        "x": 3,
        "y": 2
      },
      {
        "id": "G",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 4
      },
      {
        "id": "H",
        "axis": "h",
        "length": 2,
        "x": 4,
        "y": 0
      }
    ],
    "targetId": "A",
    "exitRow": 2,
    "instruction": "先选车，再移动。右侧黄色边是出口；可以随时撤销。",
    "solution": [
      {
        "id": "C",
        "delta": -1
      },
      {
        "id": "F",
        "delta": -2
      },
      {
        "id": "A",
        "delta": 2
      },
      {
        "id": "E",
        "delta": -3
      },
      {
        "id": "D",
        "delta": -2
      },
      {
        "id": "G",
        "delta": -2
      },
      {
        "id": "B",
        "delta": 1
      },
      {
        "id": "A",
        "delta": 2
      }
    ]
  }
];});
