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
        return 'Argumen objek setidaknya memiliki property idField, titleField, descField, yearField, linkField, dan table.';
        break;
      case 'ERR03':
        return 'Argumen objek setidaknya memiliki property idField, titleField, imageField, dirImageField, linkField, columns, dan table.';
        break;
    }
  }
}

module.exports = DocServe;