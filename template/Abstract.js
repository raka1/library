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
    switch(error) {
      case 'ERR01':
        return 'Diperlukan argumen bertipe objek untuk memanggil hook method.';
        break;
      case 'ERR02':
        return 'Argumen objek setidaknya memiliki property idValue, idField, descField, dan table.';
        break;
    }
  }
}

module.exports = AbstractPreview;