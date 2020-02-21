/** @abstract */
class Abstract {
  #mysql = require('mysql');
  #connection;
  hook = new AbstractHooking();

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  template(data) {
    this.setIdValue(data);
    this.setIdField(data);
    this.setDescField(data);
    this.setTable(data);
    this.get((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  query(sql, callback) {
      this.#connection.query(sql, (error, rows) => {
        if (error) callback(error, null);
        callback(null, rows);
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

	get(callback) {
    if (typeof this.idValue === 'undefined') {
      callback(TypeError('setIdValue(args) is undefined'), null);
    }
    if (typeof this.idField === 'undefined') {
      callback(TypeError('setIdField(args) is undefined'), null);
    }
    if (typeof this.descField === 'undefined') {
      callback(TypeError('setDescField(args) is undefined'), null);
    }
    if (typeof this.table === 'undefined') {
      callback(TypeError('setTable(args) is undefined'), null);
    }
    let style = '';
    let font = '';
    let fontFace = '';
    let size = '';
    let ellipsis = '';
    if (this.hook.font === undefined) font = '';
    else {
      fontFace = `
        <style>
          @font-face {
            font-family: docFont;
            src: url('${this.hook.font}');
          }
        </style>
      `;
      font = `font-family: docFont; `;
    }
    if (this.hook.size === undefined) size = '';
    else size = `font-size: ${this.hook.size}; `;
    if (this.hook.ellipsis === undefined) ellipsis = '';
    else ellipsis = `overflow: hidden; text-overflow: ellipsis; ` +
          `display: -webkit-box; -webkit-line-clamp: ${this.hook.ellipsis}; `+
          `-webkit-box-orient: vertical;`
    if (font !== undefined || size !== undefined || ellipsis !== undefined) {
      style = ` style='${font}${size}${ellipsis}'`;
    }
    this.query(`SELECT ${this.descField} FROM ${this.table} ` +
        `WHERE ${this.idField} = ${this.idValue}`, (error, rows) => {
      if (error) callback(error, null);
      callback(null, `${fontFace}<p${style}>${rows[0][this.descField]}</p>`);
    });
  }
}

/** @abstract */
class AbstractHook {
  /** @abstract */
  setFont() {}
  /** @abstract */
  setSize() {}
  /** @abstract */
  setEllipsis() {}
}

class AbstractHooking extends AbstractHook {
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

module.exports = Abstract;