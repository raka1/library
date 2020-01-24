let relibrary = require('relibrary');

class Search extends relibrary.Callback {
  #searchController;

  constructor() {
    super();
    this.#searchController = new relibrary.SearchController();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }
}

module.exports = Search;