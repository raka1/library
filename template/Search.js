let relibrary = require('relibrary');

class Search extends relibrary.Callback {
  #searchController = new relibrary.SearchController();

  constructor() {
    super();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }

  searchFilm(target) {
    // target.from = '';
    // target.searchBy = {};
    // target.searchBy = [];
    // return this.#searchController.search(target);
    // return this.#searchController.multiSearch(target);
  }
}

module.exports = Search;