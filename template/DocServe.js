let relibrary = require('relibrary');

class DocServe extends relibrary.Callback {
  #docServeController;

  constructor() {
    super();
    this.#docServeController = new relibrary.DocServeController();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = DocServe;