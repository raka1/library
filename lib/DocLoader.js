class DocLoader {
  #url = require('url');
  #RequestDataService = require('./RequestDataService');
  #requestDataService = new this.#RequestDataService();

  getDoc(data) {
    return new Promise((resolve, reject) => {
      
    });
  }
}

module.exports = DocLoader;