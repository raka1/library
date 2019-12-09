let relibrary = require('relibrary');

class DocView extends relibrary.Callback {
  #docLoader = new relibrary.DocLoader();

  constructor() {
    super();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }

  loadDoc(data) {
    // Tahap pembangunan...
  }
}

module.exports = DocView;