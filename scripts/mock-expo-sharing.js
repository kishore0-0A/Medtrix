let lastSharedUri = '';
let lastSharedOptions = null;

module.exports = {
  isAvailableAsync: async () => true,
  shareAsync: async (uri, options) => {
    lastSharedUri = uri;
    lastSharedOptions = options;
    return true;
  },
  getLastShare: () => ({ uri: lastSharedUri, options: lastSharedOptions }),
};
