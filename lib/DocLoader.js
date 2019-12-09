class DocLoader {
  #url = require('url');
  #RequestDataService = require('./RequestDataService');
  #requestDataService = new this.#RequestDataService();

  getDoc(target) {
    return new Promise((resolve, reject) => {
      if (target.hasOwnProperty('id') && target.hasOwnProperty('filename') &&
          target.hasOwnProperty('from')) {
        if (typeof target.id === 'object') {
          target.select = target.filename;
          target.where = `id_book = ${target.id.id_book}`;
          delete target.filename;
          delete target.id;
          this.#requestDataService.getData(target)
              .then(data => resolve(data[0][target.select]))
              .catch(error => {return error});
        } else {
          reject('Request error: getData() tidak dapat memproses dengan ' +
            'property id yang selain object (kolom_id: data).');
        }
      } else {
        reject('Doc loader error: getDoc() tidak dapat memproses dengan ' +
            'argumen yang kosong atau terjadi kesalahan lain pada argumen.');
      }
    });
  }
}

module.exports = DocLoader;