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
    switch(error) {
      case 'ERR01':
        return 'Diperlukan argumen bertipe objek untuk memanggil hook method.';
        break;
      case 'ERR02':
        return 'Argumen objek setidaknya memiliki property method, action, dan field.';
        break;
      case 'ERR03':
        return 'Argumen objek setidaknya memiliki property method, action, dan attribute.';
        break;
  }
  }
}

module.exports = DocServe;