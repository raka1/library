let relibrary = require('relibrary');

class Search extends relibrary.Callback {
  #searchController;

  constructor(config) {
    super();
    this.#searchController = new relibrary.SearchController(config);
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
        return 'Argumen objek setidaknya memiliki property method, action, dan attribute.';
        break;
  }
}

module.exports = Search;