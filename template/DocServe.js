let relibrary = require('relibrary');

class DocServe extends relibrary.Callback {
  #docServeController;

  constructor(config) {
    super();
    this.#docServeController = new relibrary.DocServeController(config);
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = DocServe;