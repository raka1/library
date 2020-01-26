class DocLoader {
  #mysql = require('mysql');
  #connection;

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.#connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  getDoc(data) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(data) && typeof data === 'object') {
        if (data.hasOwnProperty('idValue') &&
            data.hasOwnProperty('idField') &&
            data.hasOwnProperty('docData') &&
            data.hasOwnProperty('table')) {
          this.query(`SELECT ${data.docData} FROM ${data.table} ` +
              `WHERE ${data.idField} = ${data.idValue}`)
              .then(rows => resolve(rows[0][data.docData]))
              .catch(err => console.log(err));
        } else {
          reject('ERR02');
        }
      } else {
        reject('ERR01');
      }
    });
  }
}

module.exports = DocLoader;