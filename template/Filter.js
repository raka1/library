let relibrary = require('relibrary');

class Filter extends relibrary.Callback {
  #filterController = new relibrary.FilterController();

  constructor() {
    super();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }

  setFilter(data) {
    // Tahap pembangunan...
  }
}

module.exports = Filter;