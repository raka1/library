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
        return 'Diperlukan argumen pada saat memanggil hook method.';
        break;
      case 'ERR02':
        return 'Argumen untuk memanggil hook method harus bertipe object.';
        break;
      case 'ERR03':
        return 'Argumen objek setidaknya memiliki property sql atau request.';
        break;
      case 'ERR04':
        return '';
        break;
    }
  }
}

module.exports = DocServe;