function getStyle(element) {
  if (!element.style) {
    element.style = {};
  }

  for (let prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value;

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }

    if (element.style[prop].toString().match(/^[\d\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }

  return element.style;
}

function layout(element) {
  if (!element.computedStyle) return;

  const elementStyle = getStyle(element);

  if (elementStyle.display !== "flex") return;

  let items = element.children.filter((e) => e.type === "element");
  items.sort((a, b) => (a.order || 0) - (b.order || 0));

  const style = elementStyle;

  /* ------------------- 初始化默认值开始 ------------------- */
  // 初始化默认空值
  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size === ""]) {
      style[size] = null;
    }
  });

  // 初始化默认空值
  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row";
  }
  if (!style.alignItems || style.alignItems === "auto") {
    style.alignItems = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.justifyContent = "flex-start";
  }
  if (!style.flexWrap || style.flexWrap === "auto") {
    style.flexWrap = "nowrap";
  }
  if (!style.alignContent || style.alignContent === "auto") {
    style.alignContent = "stretch";
  }

  let mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;

  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;

    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }

  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = style.height;

    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }

  if (style.flexWrap === "wrap-reverse") {
    [crossEnd, crossStart] = [crossStart, crossEnd];
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }
  /* ------------------- 初始化默认值结束 ------------------- */

  /* ------------------- 布局分行开始 ------------------- */
  let isAutoMainSize = false;
  if (!style[mainSize]) {
    // auto sizing
    elementStyle[mainSize] = 0;

    for (let i = 0; i < items.length; i++) {
      // let item = items[i];
      const itemStyle = getStyle(items[i]);
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== 0) {
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize];
      }
    }

    isAutoMainSize = true;
  }

  let flexLine = [];
  let flexLines = [flexLine];
  let mainSpace = elementStyle[mainSize];
  let crossSpace = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemStyle = getStyle(item);

    // 初始化默认值
    if (itemStyle[mainSize] == null) {
      itemStyle[mainSize] = 0;
    }

    if (itemStyle.flex) {
      // 如果有 flex 属性，则表示在当前行排版
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      // nowrap 属性表示不换行
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      // 如果子项主轴 size 大于容器，则将其改为容器大小。
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

      // 处理换行情况
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }

      // 计算交叉轴剩余空间
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      // 计算主轴剩余空间
      mainSpace -= itemStyle[mainSize];
    }
  }
  flexLine.mainSpace = mainSpace;

  /* ------------------- 布局分行结束 ------------------- */

  /* ------------------- 计算主轴方向开始 ------------------- */
  // 如果 flex 容器存在 crossSize 则，当前行使用容器的 crossSize 做为交叉轴空间大小
  // 否则使用 flex 子项的最大交叉轴大小作为交叉轴空间大小。
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flex.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // overflow  (happens only if container is single line), scale every item
    // 如果主轴空间小于 0，则对所有子元素进行等比压缩
    const scale = style[mainSize] / (style[mainSize] - mainSpace);
    const currentMain = mainBase;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemStyle = getStyle(item);

      if (itemStyle.flex) {
        itemStyle[mainSize] = 0;
      }

      itemStyle[mainSize] = itemStyle[mainSize] * scale;
      itemStyle[mainStart] = currentMain;
      itemStyle[mainEnd] =
        itemStyle[mainStart] + mainSign * itemStyle[mainSize];
      currentMain = itemStyle[mainEnd];
    }
  } else {
    // process each flex line
    flexLines.forEach((items) => {
      const mainSpace = items.mainSpace;

      /*
      let flexTotal = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== 0) {
          flexTotal += items.flex;
        }
      }
      */

      const flexTotal = items.reduce((acc, curr) => {
        const itemStyle = getStyle(curr);
        return itemStyle.flex != null && itemStyle.flex !== 0
          ? acc + itemStyle.flex
          : acc;
      }, 0);

      if (flexTotal > 0) {
        // There is flexible flex items
        let currentMain = mainBase;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemStyle = getStyle(item);

          if (itemStyle.flex) {
            itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
          }

          itemStyle[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd];
        }
      } else {
        let currentMain, step;
        // There is *NO* flexible flex items, which means, justifyContent shoud work
        if (style.justifyContent === "flex-start") {
          currentMain = mainBase;
          step = 0;
        }

        if (style.justifyContent === "flex-end") {
          currentMain = mainSpace * mainSign + mainBase;
          step = 0;
        }

        if (style.justifyContent === "center") {
          currentMain = (mainSpace / 2) * mainSign + mainBase;
          step = 0;
        }

        if (style.justifyContent === "space-between") {
          step = (mainSpace / (items.length - 1)) * mainSign;
          currentMain = mainBase;
        }

        if (style.justifyContent === "space-around") {
          step = (mainSpace / items.length) * mainSign;
          currentMain = step / 2 + mainBase;
        }

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemStyle = getStyle(item);
          items[mainStart] = currentMain;
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
          currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }
  /* ------------------- 计算主轴方向结束 ------------------- */

  /* ------------------- 计算交叉轴方向开始 ------------------- */
  // let crossSpace;

  // auto sizing
  if (!style[crossSize]) {
    crossSpace = 0;
    elementStyle[crossSize] = 0;

    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] =
        elementStyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }

  if (style.flexWrap === "wrap-reverse") {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }
  const lineSize = style[crossSize] / flexLines.length;

  let step;

  if (style.alignContent === "flex-start") {
    crossBase += 0;
    step = 0;
  }
  if (style.alignContent === "flex-end") {
    crossBase += crossSize * crossSpace;
    step = 0;
  }
  if (style.alignContent === "center") {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignContent === "space-between") {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === "space-around") {
    step = crossSpace / flexLines.length;
    crossBase += (crossSign * step) / 2;
  }
  if (style.alignContent === "stretch") {
    crossBase += 0;
    step = 0;
  }

  flexLines.forEach((items) => {
    const lineCrossSize =
      style.alignContent === "stretch"
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemStyle = getStyle(item);
      const align = itemStyle.alignSelf || style.alignItems;

      if (item === null) {
        itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      }

      if (align === "flex-start") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          itemStyle[crossStart] + crossSign * itemStyle[crossSize];
      }
      if (align === "flex-end") {
        itemStyle[crossEnd] = crossBase + crossSize * lineCrossSize;
        itemStyle[crossStart] =
          itemStyle[crossEnd] - crossSign * itemStyle[crossSize];
      }
      if (align === "center") {
        itemStyle[crossStart] =
          crossBase + (crossSize * (lineCrossSize - itemStyle[crossSize])) / 2;
        itemStyle[crossEnd] = itemStyle[crossStart];
      }
      if (align === "stretch") {
        itemStyle[crossStart] = crossBase;
        itemStyle[crossEnd] =
          crossBase +
          crossSign *
            (itemStyle[crossSize] != null && itemStyle[crossSize] !== 0
              ? itemStyle[crossSize]
              : lineCrossSize);
        itemStyle[crossSize] =
          crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });

  // console.log(items);

  /* ------------------- 计算交叉轴方向结束 ------------------- */
}

module.exports = layout;
