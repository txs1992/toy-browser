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

    if (itemStyle[mainSize] == null) {
      itemStyle[mainSize] = 0;
    }

    if (itemStyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" && isAutoMainSize) {
      mainSpace -= itemStyle[mainSize];
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize];
      }

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

      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== 0) {
        crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
      }
      mainSpace -= itemStyle[mainSize];
    }
  }

  flexLine.mainSpace = mainSpace;
  /* ------------------- 布局分行结束 ------------------- */

  /* ------------------- 计算主轴方向开始 ------------------- */
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace = style[crossSize !== undefined]
      ? style[crossSize]
      : crossSpace;
  } else {
    flex.crossSpace = crossSpace;
  }

  if (mainSpace < 0) {
    // overflow  (happens only if container is single line), scale every item
    // 如果超出就等比例缩放
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
      let flexTotal = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemStyle = getStyle(item);

        if (itemStyle.flex !== null && itemStyle.flex !== 0) {
          flexTotal += items.flex;
        }
      }

      if (flexTotal > 0) {
        // There is flexible flex items
        const currentMain = mainBase;
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
          step = (mainSpace / items.lengt) * mainSign;
          currentMain = step / 2 + mainBase;
        }

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const itemStyle = getStyle(item);
          items[mainStart] = currentMain;
          // itemStyle[(mainSign, currentMain)];
          itemStyle[mainEnd] =
            itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd] + step;
        }
      }
    });
  }
  /* ------------------- 计算主轴方向结束 ------------------- */
}

module.exports = layout;
