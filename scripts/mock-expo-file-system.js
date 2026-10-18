let lastCopiedFile = null;
let lastWrittenFile = null;

const EncodingType = {
  UTF8: 'utf8',
  Base64: 'base64',
};

module.exports = {
  documentDirectory: 'file:///mock/data/documents/',
  cacheDirectory: 'file:///mock/data/cache/',
  EncodingType,
  copyAsync: async ({ from, to }) => {
    lastCopiedFile = { from, to };
  },
  writeAsStringAsync: async (uri, content, options) => {
    lastWrittenFile = { uri, content, options };
  },
  getInfoAsync: async (uri) => ({ exists: true, size: 45280 }),
  getLastCopied: () => lastCopiedFile || (lastWrittenFile ? { from: 'base64', to: lastWrittenFile.uri } : null),
  getLastWritten: () => lastWrittenFile,
};
