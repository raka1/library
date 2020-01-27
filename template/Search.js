let relibrary = require('relibrary');

class Search extends relibrary.Callback {
  #searchController;

  constructor() {
    super();
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
        return 'Argumen objek setidaknya memiliki property action, dan field.';
        break;
      case 'ERR03':
        return 'Argumen objek setidaknya memiliki property action, dan attribute.';
        break;
    }
  }
}

module.exports = Search;