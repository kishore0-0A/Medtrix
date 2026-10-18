let lastGeneratedHtml = '';

module.exports = {
  printToFileAsync: async (options) => {
    lastGeneratedHtml = options?.html || '';
    return {
      uri: 'file:///mock/cache/Print_generated_temp.pdf',
      numberOfPages: 3,
      base64: options?.base64 ? 'JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDw...' : undefined,
    };
  },
  getLastHtml: () => lastGeneratedHtml,
};
