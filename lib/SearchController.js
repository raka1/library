class SearchController {
  #url = require('url');
  #RequestDataService = require('./RequestDataService');
  #requestDataService = new this.#RequestDataService();

  method(request, thisUrl) {
    let where;

    if (request.table === 'undefined') {
      reject('Search error: property from dibutuhkan untuk melakukan ' +
          'pencarian terhadap table.');
    }

    if (request.method == 'GET') {
      where = '';
      let i = 0;
      for (let [property, value] of Object.entries(thisUrl.query)) {
        i++;
        where = `${where}${property} LIKE \'%${value}%\'`;
        if (i === Object.keys(thisUrl.query).length) {
          break;
        } else {
          where = `${where} OR WHERE `;
        }
      }
      request.where = where;
      let answer = this.#requestDataService.getData(request)
      delete request.select;
      delete request.from;
      delete request.where;
      delete request.search;
      delete request.limit;
      delete request.offset;
      return answer;
    } else if (request.method == 'POST') {

    } else {
      reject('Search error: tidak dapat menggunakan pencarian untuk ' +
          'request yang menggunakan metode selain get dan post.');
    }
  }

  search(request) {
    return new Promise((resolve, reject) => {
      let thisUrl = this.#url.parse(request.url, true);
      resolve(this.method(request, thisUrl));
    });
  }

  operator(target) {

  }
}

module.exports = SearchController;