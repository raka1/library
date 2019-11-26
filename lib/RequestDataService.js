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

  join(target) {

  }

	getData(target) {
    let select;
    let from;
    let where;
    let limitOffset;
    let limit;
    let offset;

    return new Promise ((resolve, reject) => {
      // Jika parameter berupa string
      if (typeof target === 'string') {
        select = '*';
        from = target;
        limitOffset = '';
      // Jika parameter berupa object
      } else if (typeof target === 'object') {
        if (target.hasOwnProperty('from')) {
          if (target.from.hasOwnProperty('table') &&
              target.from.hasOwnProperty('join')) {
            if (typeof target.from.table === 'string') {
              if (target.from.hasOwnProperty('on')) {
                from = `${target.from.table} JOIN ${target.from.join} ON ` +
                `'${Object.keys(target.from.on)[0]}' = ` +
                `'${Object.values(target.from.on)[0]}'`;
              } else if (target.from.hasOwnProperty('using')) {
                from = `${target.from.table} JOIN ${target.from.join} ` +
                `USING(${target.from.using})`;
              } else {
                from = `${target.from.table} JOIN ${target.from.join}`;
              }
            } else if (typeof target.from.table === 'object') {

            } else {

            }
          } else {
            from = target.from;
          }
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
      // Jika paramater kosong atau selain string dan object
      } else {
        reject('Request error: getData() tidak dapat memproses dengan ' +
          'argumen yang kosong atau terjadi kesalahan lain pada argumen.');
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