function wordsCounterDelimiterSpace(text) {
  let testEn = new RegExp('[\u4E00-\u9FA5| ]+');
  if (testEn.test(text[0])) {
    return text.length;
  } else {
    return text.split(/[\s]/).filter(item => item !== '').length;
  }
}

const TextFuncs = {
  wordsCounterDelimiterSpace: wordsCounterDelimiterSpace,
};
export default TextFuncs;
