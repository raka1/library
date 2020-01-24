let relibrary = require('relibrary');

class Filter extends relibrary.Callback {
  #filterController;

  constructor(config) {
    super();
    this.#filterController = new relibrary.FilterController(config);
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = Filter;