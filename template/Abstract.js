let relibrary = require('relibrary');

class Abstract extends relibrary.Callback {
  #abstractLoader;

  constructor(config) {
    super();
    this.#abstractLoader = new relibrary.AbstractLoader(config);
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = AbstractPreview;