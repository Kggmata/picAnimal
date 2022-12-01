const draggableFlatListUtils = {
  randomColor: () => {
    let r = Math.round(Math.random() * 175);
    let g = Math.round(Math.random() * 175);
    while (r + g > 400) {
      r = Math.round(Math.random() * 175);
      g = Math.round(Math.random() * 175);
    }
    let b = 600 - r - g;
    return {
      r: r,
      g: g,
      b: b,
    };
  },
  getColor: (text, randomColor, background) => {
    let percentage;
    if (text) {
      if (text.split('-')[1]) {
        percentage = Math.sqrt(text.split('-')[1].replace('%', '') / 100);
      }
    }
    if (
      randomColor.r / percentage > 240 &&
      randomColor.g / percentage > 240 &&
      randomColor.b / percentage > 240
    ) {
      return '#d4d4d4';
    } else {
      return `rgba(${Math.round(
        percentage ? randomColor.r / percentage : randomColor.r,
      )}, ${Math.round(
        percentage ? randomColor.g / percentage : randomColor.g,
      )}, ${Math.round(
        percentage ? randomColor.b / percentage : randomColor.b,
      )},${background ? 0.2 : 1})`;
    }
  },
  getColorFromPercentage: (percentage, randomColor, background) => {
    if (
      randomColor.r / percentage > 240 &&
      randomColor.g / percentage > 240 &&
      randomColor.b / percentage > 240
    ) {
      return '#d4d4d4';
    } else {
      return `rgba(${Math.round(
        percentage ? randomColor.r / percentage : randomColor.r,
      )}, ${Math.round(
        percentage ? randomColor.g / percentage : randomColor.g,
      )}, ${Math.round(
        percentage ? randomColor.b / percentage : randomColor.b,
      )},${background ? 0.2 : 1})`;
    }
  },
};
export default draggableFlatListUtils;
