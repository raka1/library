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
    this.getDocData(data)
        .then(data => data)
        .catch(err => console.log(err));
  }

  /** @template method */
  templateRenderDoc(data) {
    this.setResponseData(data);
    this.setIdValue(data);
    this.setIdField(data);
    this.setDocData(data);
    this.setDir(data);
    this.setTable(data);
    this.renderDoc()
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

  setResponseData(data) {
    this.response = data;
    return this;
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

  getDocData(data) {
    return new Promise((resolve, reject) => {
      if (typeof this.idValue === 'undefined') {
        reject('Get doc data error: setIdValue(args) is undefined.');
      }
      if (typeof this.idField === 'undefined') {
        reject('Get doc data error: setIdField(args) is undefined.');
      }
      if (typeof this.table === 'undefined') {
        reject('Get doc data error: setTable(args) is undefined.');
      }
      this.query(`SELECT ${data} FROM ${this.table} ` +
          `WHERE ${this.idField} = ${this.idValue}`)
          .then(rows => resolve(rows[0][data]))
          .catch(err => console.log(err));
    });
  }

  renderDoc() {
    return new Promise((resolve, reject) => {
      if (typeof this.response === 'undefined') {
        reject('Render doc error: setResponseData(args) is undefined.');
      }
      if (typeof this.idField === 'undefined') {
        reject('Render doc error: setIdField(args) is undefined.');
      }
      if (typeof this.docData === 'undefined') {
        reject('Render doc error: setDocData(args) is undefined.');
      }
      if (typeof this.table === 'undefined') {
        reject('Render doc error: setTable(args) is undefined.');
      }
      if (typeof this.dir === 'undefined') {
        reject('Get doc data error: setDir(args) is undefined.');
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
          `WHERE ${this.idField} = ${this.idValue}`)
          .then(rows => {
            this.#fs.readFile(this.dir + rows[0][this.docData],
                  (error, content) => {
              this.response.writeHead(200,
                  {'Content-Type': 'application/pdf'});
              resolve(content);
            });
          }).catch(err => console.log(err));
    });
  }
}

module.exports = Doc;