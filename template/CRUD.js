let relibrary = require('relibrary');

class Abstract extends relibrary.Callback {
  #bookManagement;

  constructor(config) {
    super();
    this.#bookManagement = new relibrary.BookManagement(config);
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = AbstractPreview;