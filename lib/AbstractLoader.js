class AbstractLoader {
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

  getAbstractText(data) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(data) && typeof data === 'object') {
          if (data.hasOwnProperty('idValue') &&
              data.hasOwnProperty('idField') &&
              data.hasOwnProperty('descField') &&
              data.hasOwnProperty('table')) {
            this.query(`SELECT ${data.descField} FROM ${data.table} ` +
                `WHERE ${data.idField} = ${data.idValue}`)
                .then(rows => {
                  if (data.hasOwnProperty('font') ||
                      data.hasOwnProperty('size') ||
                      data.hasOwnProperty('ellipsis')) {
                    resolve(this.textStyle(rows[0][data.descField], data.font,
                        data.size, data.ellipsis));
                  } else {
                    resolve(`<p>${rows[0][data.descField]}</p>`);
                  }
                })
                .catch(err => console.log(err));
          } else {
            reject('ERR02');
          }
        } else {
          reject('ERR01');
        }
    });
  }

  textStyle(data, font = undefined, size = undefined, ellipsis = undefined) {
    let mFont = '';
    let mSize = '';
    let mEllipsis = '';
    let style = '';

    if (font !== undefined) mFont = `font-family: ${font}; `;
    if (size !== undefined) mSize = `font-size: ${size}; `;
    if (ellipsis !== undefined) {
      mEllipsis = `overflow: hidden; text-overflow: ellipsis; ` +
          `display: -webkit-box; -webkit-line-clamp: ${ellipsis}; ` +
          `-webkit-box-orient: vertical;`
    }
    if (font !== undefined || size !== undefined || ellipsis !== undefined) {
      style = ` style='${mFont}${mSize}${mEllipsis}'`;
    }
    return `<p${style}>${data}</p>`;
  }
}

module.exports = AbstractLoader;