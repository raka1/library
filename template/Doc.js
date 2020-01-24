let relibrary = require('relibrary');

class Doc extends relibrary.Callback {
  #docLoader;

  constructor() {
    super();
    this.#docLoader = new relibrary.DocLoader();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = Doc;