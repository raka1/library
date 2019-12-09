let relibrary = require('relibrary');

class DocPreview extends relibrary.Callback {
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

  loadDoc() {
    // Tahap pembangunan...
  }
}

module.exports = DocPreview;