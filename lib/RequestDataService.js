class RequestDataService {
  #mysql = require('mysql');
  #config = require('./../../../config/DatabaseConfig');
  #connection = this.#mysql.createConnection(this.#config);

  constructor() {
    this.#connection.connect((err) => {
      if (err) throw err;
    });
  }

  query(sql) {
    return new Promise((resolve, reject) => {
      this.#connection.query(sql, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.#connection.end(err => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }

  join(target) {
    let query;

    if (typeof target.table === 'string') {
      if (target.hasOwnProperty('on')) {
        return `${target.table} JOIN ${target.join} ON ` +
            `${target.table}.${Object.keys(target.on)[0]} = ` +
            `${target.join}.${Object.values(target.on)[0]}`;
      } else if (target.hasOwnProperty('using')) {
        return `${target.table} JOIN ${target.join} ` +
            `USING(${target.using})`;
      } else {
        return `${target.table} JOIN ${target.join}`;
      }
    } else if (typeof target.table === 'object') {
      query = this.join(target.table);
      if (target.hasOwnProperty('on')) {
        return `${query} JOIN ${target.join} ON ` +
            `${target.table}.${Object.keys(target.on)[0]} = ` +
            `${target.join}.${Object.values(target.on)[0]}`;
      } else if (target.hasOwnProperty('using')) {
        return `${query} JOIN ${target.join} ` +
            `USING(${target.using})`;
      } else {
        return `${query} JOIN ${target.join}`;
      }
    }
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
            from = this.join(target.from);
          } else {
            from = target.from;
          }
          if (target.hasOwnProperty('select')) {
            select = target.select;
          } else {
            select = '*';
          }
          if (target.hasOwnProperty('where')) {
            if (typeof target.where === 'object') {
              where = ` WHERE ${Object.keys(target.where)[0]} = ` +
                  `'${Object.values(target.where)[0]}'`;
            } else {
              where = ` WHERE ${target.where}`;
            }
          } else if (target.hasOwnProperty('search')) {
            where = ` WHERE ${Object.keys(target.search)[0]} LIKE ` +
                `'%${Object.values(target.search)[0]}%'`;
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
          reject('Request error: getData() membutuhkan setidaknya property ' +
              'object \'from\' untuk mendapatkan data dari tabel yang ' +
              'ditentukan.');
        }
      // Jika paramater kosong atau selain string dan object
      } else {
        reject('Request error: getData() tidak dapat memproses dengan ' +
            'argumen yang kosong atau terjadi kesalahan lain pada argumen.');
      }

      let query;  // template string untuk query
      if (typeof target !== 'object' &&
          target.toUpperCase().startsWith('SELECT ')) {
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
    let into;
    let columns;
    let values;

    return new Promise ((resolve, reject) => {   
      if (data.hasOwnProperty('data') && data.hasOwnProperty('table')) {
        columns = '(';
        values = '(';
        let i = 0;
        for (let [prop, value] of Object.entries(data.data)) {
          i++;
          columns = `${columns}${prop}`;
          values = `${values}'${value}'`;
          if (i === Object.keys(data.data).length) {
            break;
          } else {
            columns = `${columns}, `;
            values = `${values}, `;
          }
        }
        columns = `${columns})`;
        values = `${values})`;
        into = data.table;
      } else {
        reject('Request error: postData() tidak dapat diproses karena ' +
            'argumen setidaknya object yang memiliki property data dan table.')
      }

      let query;  // template string untuk query
      if (typeof data !== 'object' &&
          data.toUpperCase().startsWith('INSERT ')) {
        query = data;
      } else {
        query = `INSERT INTO ${into} ${columns} VALUES ${values}`;
      }
   
      console.log(query);
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

  putData(data) {
    let update;
    let set;
    let where;

    return new Promise ((resolve, reject) => {
      if (data.hasOwnProperty('data') && data.hasOwnProperty('table')) {
        set = '';
        let i = 0;
        for (let [prop, value] of Object.entries(data.data)) {
          i++;
          set = `${prop} = '${value}'`;
          if (i === Object.keys(data.data).length) {
            break;
          } else {
            set = `${set}, `;
          }
        }
        update = data.table;
        if (data.hasOwnProperty('where')) {
          if (typeof data.where === 'object') {
            where = ` WHERE ${Object.keys(data.where)[0]} = ` +
                `'${Object.values(data.where)[0]}'`;
          } else {
            where = ` WHERE ${data.where}`;
          }
        }
      } else {
        reject('Request error: putData() tidak dapat diproses karena ' +
            'argumen setidaknya object yang memiliki property data dan table.')
      }

      let query;  // template string untuk query
      if (typeof data !== 'object' &&
          data.toUpperCase().startsWith('UPDATE ')) {
        query = target;
      } else {
        query = `UPDATE ${update} SET ${set}${where}`;
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

  deleteData(target) {
    let from;
    let where;
    let id;
    let value;

    return new Promise ((resolve, reject) => {
      // Jika parameter berupa string
      if (typeof target === 'string') {
        from = target;
        where = '';
      // Jika parameter berupa object
      } else if (typeof target === 'object') {
        if (target.hasOwnProperty('from')) {
          from = target.from;
          if (target.hasOwnProperty('where')) {
            if (typeof target.where === 'string') {
              where = ` WHERE id = '${target.where}'`;
            } else if (typeof target.where === 'object') {
              where = ` WHERE ${Object.keys(target.where)[0]} = ` +
                  `'${Object.values(target.where)[0]}'`;
            } else {
              where = '';
            }
          }
        } else {
          reject('Request error: deleteData() membutuhkan setidaknya argumen' +
              ' \'from\' untuk menghapus data dari tabel yang ditentukan.');
        }
      // Jika paramater kosong atau selain string dan object
      } else {
        reject('Request error: deleteData() tidak dapat memproses dengan ' +
            'argumen yang kosong atau terjadi kesalahan lain pada argumen.');
      }

      let query;  // template string untuk query
      if (typeof target !== 'object' &&
          target.toUpperCase().startsWith('DELETE ')) {
        query = target;
      } else {
        query = `DELETE FROM ${from}${where}`;
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
}

module.exports = RequestDataService;