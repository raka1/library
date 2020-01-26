let relibrary = require('relibrary');

class Doc extends relibrary.Callback {
  #docLoader;

  constructor(config) {
    super();
    this.#docLoader = new relibrary.DocLoader(config);
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    switch(error) {
      case 'ERR01':
        return 'Diperlukan argumen bertipe objek untuk memanggil hook method.';
        break;
      case 'ERR02s':
        return 'Argumen objek setidaknya memiliki property idValue, idField, descField, dan table.';
        break;
    }
  }
}

module.exports = Doc;