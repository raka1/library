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
    return error;
  }
}

module.exports = Search;