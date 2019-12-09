let relibrary = require('relibrary');

class AbstractPreview extends relibrary.Callback {
  #abstractPreview = new relibrary.AbstractPreview();

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

module.exports = AbstractPreview;