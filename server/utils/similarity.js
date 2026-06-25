const tokenize = (code) => {
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .match(/[A-Za-z_]\w*|[{}()\[\];,.]/g) || [];
};

const jaccardSimilarity = (codeA, codeB) => {
  const tokensA = new Set(tokenize(codeA));
  const tokensB = new Set(tokenize(codeB));
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
};

module.exports = { jaccardSimilarity };