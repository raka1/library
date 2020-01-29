/** @abstract */
class Abstract {
  #mysql = require('mysql');
  #connection;

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  template(data) {
    this.setIdValue(data);
    this.setIdField(data);
    this.setDescField(data);
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

  setDescField(data) {
    this.descField = data;
    return this;
  }

  setTable(data) {
    this.table = data;
    return this;
  }

	get() {
    return new Promise((resolve, reject) => {
      let style = '';
      let font = '';
      let size = '';
      let ellipsis = '';
      if (this.font === undefined) font = '';
      else font = `font-family: ${this.font}; `;
      if (this.size === undefined) size = '';
      else size = `font-size: ${this.size}; `;
      if (this.ellipsis === undefined) ellipsis = '';
      else ellipsis = `overflow: hidden; text-overflow: ellipsis; ` +
            `display: -webkit-box; -webkit-line-clamp: ${this.ellipsis}; ` +
            `-webkit-box-orient: vertical;`
      if (font !== undefined || size !== undefined || ellipsis !== undefined) {
        style = ` style='${font}${size}${ellipsis}'`;
      }
      this.query(`SELECT ${this.descField} FROM ${this.table} ` +
          `WHERE ${this.idField} = ${this.idValue}`)
          .then(rows => resolve(`<p${style}>${rows[0][this.descField]}</p>`))
          .catch(err => console.log(err));
    });
  }

  setFont(data) {
    this.font = data;
    return this;
  }

  setSize(data) {
    this.size = data;
    return this;
  }

  setEllipsis(data) {
    this.ellipsis = data;
    return this;
  }
}

class AbstractHook {
  hook() {}
}

exports.Abstract = Abstract;
exports.AbstractHook = AbstractHook;