let relibrary = require('relibrary');

class Filter extends relibrary.Callback {
  #filterController;

  constructor() {
    super();
    this.#filterController = new relibrary.FilterController();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = Filter;