// Refactored from LiveScript - removed IIFE, var→const/let, replaced repeatString$ with String.repeat()

const pad = function(str, num) {
  const len = str.length;
  const padAmount = num - len;
  return str + ' '.repeat(padAmount > 0 ? padAmount : 0);
};

module.exports = {
  pad: pad
};
