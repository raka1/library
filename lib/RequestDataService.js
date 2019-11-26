class RequestDataService {
  constructor() {
    this.mysql = require('mysql');

    // tempat konfigurasi yang diatur oleh pengguna akhir/programmer
    this.config = require('./../config/DatabaseConfig');

    this.connection = this.mysql.createConnection(this.config);
    this.connection.connect((err) => {
      if (err) throw err;
    });
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }

	getData(target) {
    let select;
    let from;
    let where;
    let limitOffset;
    let limit;
    let offset;

    return new Promise ((resolve, reject) => {
      if (typeof target === 'string') {
        select = '*';
        from = target;
        limitOffset = '';
      } else if (typeof target === 'object') {
        if (target.hasOwnProperty('from')) {
          from = target.from;
          if (target.hasOwnProperty('select')) {
            select = target.select;
          } else {
            select = '*';
          }
          if (target.hasOwnProperty('where')) {
            if (target.where.hasOwnProperty('column') &&
              target.where.hasOwnProperty('value')) {
              where = ` WHERE ${target.where.column} = ` +
              `\'${target.where.value}\'`;
            }
          } else if (target.hasOwnProperty('search')) {
            if (target.search.hasOwnProperty('column') &&
              target.search.hasOwnProperty('value')) {
              where = ` WHERE ${target.search.column} LIKE ` + 
              `\'%${target.search.value}%\'`;
            }
          } else {
            where = '';
          }
          if (target.hasOwnProperty('limit')) {
            if (target.hasOwnProperty('offset')) {
              limitOffset = ` LIMIT ${target.limit} OFFSET ${target.offset}`;
            } else {
              limitOffset = ` LIMIT ${target.limit}`;
            }
          } else {
            limitOffset = '';
          }
        } else {
          reject('Request error: getData() membutuhkan setidaknya argumen ' +
            '\'from\' untuk mendapatkan data dari tabel yang ditentukan.');
        }
      } else {
        reject('Request error: getData() tidak dapat memproses dengan ' +
          'argumen yang kosong.');
      }

      let query;  // template string untuk query
      if (typeof target !== 'object' &&
          target.toUpperCase().startsWith('SELECT')) {
        query = target;
      } else {
        query = `SELECT ${select} FROM ${from}${where}${limitOffset}`;
      }

      this.query(query)
          .then(rows => {
            resolve(rows);
          })
          .then(rows => {
            this.close();
          })
          .catch(err => {
            console.log(err);
          });
    });
  }

  postData(data) {

  }

  putData(target) {

  }

  deleteData(target) {

  }
}

module.exports = RequestDataService;