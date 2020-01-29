/** @abstract */
class Doc {
  #mysql = require('mysql');
  #connection;

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  template(data) {
    this.setIdValue(data);
    this.setIdField(data);
    this.setDocData(data);
    this.setTable(data);
    this.get()
        .then(data => data)
        .catch(err => console.log(err));
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.#connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  setIdValue(data) {
    this.idValue = data;
    return this;
  }

  setIdField(data) {
    this.idField = data;
    return this;
  }

  setDocData(data) {
    this.docData = data;
    return this;
  }

  setTable(data) {
    this.table = data;
    return this;
  }

  get() {
    return new Promise((resolve, reject) => {
      this.query(`SELECT ${this.docData} FROM ${this.table} ` +
          `WHERE ${this.idField} = ${this.idValue}`)
          .then(rows => resolve(rows[0][this.docData]))
          .catch(err => console.log(err));
    });
  }
}

class DocHook {
  hook() {}
}

exports.Doc = Doc;
exports.DocHook = DocHook;