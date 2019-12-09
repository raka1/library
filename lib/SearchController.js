class SearchController {
  #url = require('url');
  #RequestDataService = require('./RequestDataService');
  #requestDataService = new this.#RequestDataService();

  multiSearch(request, result = true) {
    return new Promise((resolve, reject) => {
      let thisUrl = this.#url.parse(request.url, true);
      let where;

      if (typeof request.from === 'undefined') {
        reject('Search error: property from dibutuhkan untuk melakukan ' +
            'pencarian terhadap table.');
      } else if (typeof request.searchBy === 'undefined') {
        reject('Search error: property searchBy dibutuhkan untuk mencari' +
            ' berdasarkan apa saja dalam bentuk object.');
      } else {
        request.model = {};
        request.model.from = request.from;
        delete request.from;
      }

      if (request.method == 'GET') {
        where = '';
        let i = 0;
        for (let [property, value] of Object.entries(thisUrl.query)) {
          i++;
          value = value.trim();
          where = `${where}${property} LIKE \'%${value}%\'`;
          if (i === Object.keys(thisUrl.query).length) {
            break;
          } else {
            where = `${where} AND `;
          }
        }
        request.model.where = where;
        if (result) {
          resolve(this.#requestDataService.getData(request.model));
        } else {
          resolve(request.model);
        }
      } else if (request.method == 'POST') {

      } else {
        reject('Search error: tidak dapat menggunakan pencarian untuk ' +
            'request yang menggunakan metode selain get dan post.');
      }
    });
  }

  search(request, result = true) {
    return new Promise((resolve, reject) => {
      let thisUrl = this.#url.parse(request.url, true);
      let where;

      if (typeof request.from === 'undefined') {
        reject('Search error: property from dibutuhkan untuk melakukan ' +
            'pencarian terhadap table.');
      } else if (typeof request.searchBy === 'undefined') {
        reject('Search error: property searchBy dibutuhkan untuk mencari' +
            ' berdasarkan apa saja dalam bentuk array.');
      } else {
        request.model = {};
        request.model.from = request.from;
        request.model.searchBy = request.searchBy;
        request.model.thisUrl = thisUrl;
        delete request.from;
        delete request.query;
      }

      if (request.method == 'GET') {
        let query;
        where = '';
        let i = 0;
        for (let [property, value] of Object.entries(thisUrl.query)) {
          if (typeof value === 'object') {
            value = value[0];
          }
          query = value;
          break;
        }
        request.model.searchBy.forEach(value => {
          i++;
          where = `${where}${value} LIKE \'%${query}%\'`;
          if (i !== request.model.searchBy.length) {
            where = `${where} OR `;
          }
        });
        request.model.where = where;
        if (result) {
          resolve(this.#requestDataService.getData(request.model));
        } else {
          request.model.docServe = true;
          resolve(request.model);
        }
      } else if (request.method == 'POST') {

      } else {
        reject('Search error: tidak dapat menggunakan pencarian untuk ' +
            'request yang menggunakan metode selain get dan post.');
      }
    });
  }
}

module.exports = SearchController;