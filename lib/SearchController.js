class SearchController {
  #url = require('url');
  #RequestDataService = require('./RequestDataService');
  #requestDataService = new this.#RequestDataService();

  multiSearch(request, operator = ['OR']) {
    return new Promise((resolve, reject) => {
      let thisUrl = this.#url.parse(request.url, true);
      let where;

      if (typeof request.from === 'undefined') {
        reject('Search error: property from dibutuhkan untuk melakukan ' +
            'pencarian terhadap table.');
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
          if (typeof operator[i-1] === 'string') {
            operator[i-1] = operator[i-1].toUpperCase();
            if (operator[i-1] !== 'OR' && operator[i-1] !== 'AND') {
              operator[i-1] = 'OR';
            }
          } else {
            operator[i-1] = 'OR';
          }
          where = `${where}${property} LIKE \'%${value}%\'`;
          if (i === Object.keys(thisUrl.query).length) {
            break;
          } else {
            where = `${where} ${operator} `;
          }
        }
        request.model.where = where;
        resolve(this.#requestDataService.getData(request));
      } else if (request.method == 'POST') {

      } else {
        reject('Search error: tidak dapat menggunakan pencarian untuk ' +
            'request yang menggunakan metode selain get dan post.');
      }
    });
  }

  search(request) {
    return new Promise((resolve, reject) => {
      let where;

      if (typeof request.from === 'undefined') {
        reject('Search error: property from dibutuhkan untuk melakukan ' +
            'pencarian terhadap table.');
      } else {
        request.model = {};
        request.model.from = request.from;
        delete request.from;
      }

      if (request.method == 'GET') {
        where = '';
      } else if (request.method == 'POST') {

      } else {
        reject('Search error: tidak dapat menggunakan pencarian untuk ' +
            'request yang menggunakan metode selain get dan post.');
      }
    });
  }
}

module.exports = SearchController;