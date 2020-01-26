class DocServeController {
  #url = require('url');
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

  // let body = '';
  //       req.on('data', chuck => {
  //         body += chuck.toString();
  //       });
  //       req.on('end', () => {
  //         let lone = qs.parse(body);
  //         console.log(lone);
  //         res.end('ok');
  //       });

  listView(data) {
    return new Promise((resolve, reject) => {
      if(data !== null) {
        if (!Array.isArray(data) && typeof data === 'object') {
          if (data.hasOwnProperty('titleField') &&
              data.hasOwnProperty('descField') &&
              data.hasOwnProperty('yearField') &&
              data.hasOwnProperty('table')) {
            let filter = '';
            if (data.hasOwnProperty('request')) {
              if (data.request.method === 'GET') {
                let thisUrl = this.#url.parse(data.request.url, true);
                if (typeof thisUrl.query._attribute !== 'undefined') {
                  let query = thisUrl.query.q;
                  let attribute = thisUrl.query._attribute.split(',');
                  filter = `${filter} WHERE `;
                  for (var i = 0; i < attribute.length; i++) {
                    filter = `${filter}${attribute[i]} LIKE '%${query}%'`;
                    if (i !== attribute.length-1) filter = `${filter} OR `;
                  }
                } else if (typeof thisUrl.query._operator !== 'undefined') {

                }
              } else {

              }
            }
            console.log(`SELECT ${data.titleField}, ${data.descField}, ` +
                `${data.yearField} FROM ${data.table}${filter}`);
            this.query(`SELECT ${data.titleField}, ${data.descField}, ` +
                `${data.yearField} FROM ${data.table}${filter}`)
                .then(rows => resolve(rows))
                .catch(err => console.log(err));
          } else {
            reject('ERR03');
          }
        } else {
          reject('ERR02');
        }
      } else {
        reject('ERR01');
      }
    });
  }

  tileList(data) {
    return new Promise((resolve, reject) => {
      if(data !== null) {
        if (!Array.isArray(data) && typeof data === 'object') {
           if (data.hasOwnProperty('titleField') &&
              data.hasOwnProperty('imageField') &&
              data.hasOwnProperty('table')) {

          } else {
            reject('ERR03');
          }
        } else {
          reject('ERR02');
        }
      } else {
        reject('ERR01');
      }
    });
  }
}

module.exports = DocServeController;