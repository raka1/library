/** @abstract */
class Doc {
  #fs = require('fs');
  #mysql = require('mysql');
  #connection;

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  templateGetDocData(data) {
    this.setIdValue(data);
    this.setIdField(data);
    this.setTable(data);
    this.getDocData(data, (error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  /** @template method */
  templateRenderDoc(data) {
    this.setIdValue(data);
    this.setIdField(data);
    this.setDocData(data);
    this.setDir(data);
    this.setTable(data);
    this.renderDoc((error, data) => {
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

  setDocData(data) {
    this.docData = data;
    return this;
  }

  setTable(data) {
    this.table = data;
    return this;
  }

  setDir(data) {
    this.dir = data;
    return this;
  }

  getDocData(data, callback) {
    if (typeof this.idValue === 'undefined') {
      callback(TypeError('setIdValue(args) is undefined.'), null);
    }
    if (typeof this.idField === 'undefined') {
      callback(TypeError('setIdField(args) is undefined.'), null);
    }
    if (typeof this.table === 'undefined') {
      callback(TypeError('setTable(args) is undefined.'), null);
    }
    this.query(`SELECT ${data} FROM ${this.table} ` +
        `WHERE ${this.idField} = ${this.idValue}`, (error, rows) => {
      if (error) callback(error, null);
      callback(null, rows[0][data]);
    });
  }

  renderDoc(callback) {
    if (typeof this.idField === 'undefined') {
      callback(TypeError('setIdField(args) is undefined.'), null);
    }
    if (typeof this.docData === 'undefined') {
      callback(TypeError('setDocData(args) is undefined.'), null);
    }
    if (typeof this.table === 'undefined') {
      callback(TypeError('setTable(args) is undefined.'), null);
    }
    if (typeof this.dir === 'undefined') {
      callback(TypeError('setDir(args) is undefined.'), null);
    }
    this.dir = this.dir.split('/');
    if (this.dir[this.dir.length - 1] !== '') {
      this.dir.push('');
    }
    if (this.dir[0] === '') this.dir[0] = '.';
    else if (this.dir[0] !== '' && this.dir[0] !== '.')
      this.dir.unshift('.');
    let flag = 0;
    for (var i = 0; i < this.dir.length; i++) {
      if (this.dir[i] === '' && flag === 0) flag = 1;
      else if (this.dir[i] === '' && flag === 1) {
        this.dir.splice(i, 1);
        i -= 1;
      }
      else if (this.dir[i] !== '' && flag === 1) flag = 0;
    }
    this.dir = this.dir.join('/');
    this.query(`SELECT ${this.docData} FROM ${this.table} ` +
        `WHERE ${this.idField} = ${this.idValue}`, (error, rows) => {
      if (error) callback(error, null);
      this.#fs.readFile(this.dir + rows[0][this.docData],
          (error, content) => callback(null, content));
    });
  }
}

module.exports = Doc;