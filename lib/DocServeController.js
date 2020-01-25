class DocServeController {
  #mysql = require('mysql');
  #connection;

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  listView(data) {

  }

  tileList(data) {

  }
}

module.exports = DocServeController;