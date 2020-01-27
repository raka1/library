class DocServeController {
  #url = require('url');
  #qs = require('querystring');
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

  listTemplate(data, rows) {
    let template = `
      <style>
        .listView {
          margin-bottom: 10px;
        }
        .listView div a {
          color: #2980b9;
          text-decoration: none;
        }
        .listView div a:hover {
          text-decoration: underline;
        }
        .listView div:nth-of-type(1) {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .listView div:nth-of-type(2) {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      </style>
      ${Object.keys(rows).map((index) => {
        return `
          <div class='listView'>
            <div>
              <a href="/${data.dirLink}/${rows[index][data.idField]}">
                ${rows[index][data.titleField]}
              </a>
            </div>
            <div>${rows[index][data.descField]}</div>
            <div>${rows[index][data.yearField]}</div>
          </div>
        `;
      }).join('')}
    `;

    return template;
  }

  listView(data) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(data) && typeof data === 'object') {
        if (data.hasOwnProperty('idField') &&
            data.hasOwnProperty('titleField') &&
            data.hasOwnProperty('descField') &&
            data.hasOwnProperty('yearField') &&
            data.hasOwnProperty('dirLink') &&
            data.hasOwnProperty('table')) {
          if (data.hasOwnProperty('request')) {
            let query;
            let attribute;
            let operator;
            let filter = '';
            let thisUrl = this.#url.parse(data.request.url, true);
            if (data.request.method === 'GET') {
              if (typeof thisUrl.query._attribute !== 'undefined') {
                query = thisUrl.query.q;
                attribute = thisUrl.query._attribute.split(',');
                filter = filter + ' WHERE ';
                for (var i = 0; i < attribute.length; i++) {
                  filter = `${filter}${attribute[i]} LIKE '%${query}%'`;
                  if (i !== attribute.length-1) filter = filter + ' OR ';
                }
              } else if (typeof thisUrl.query._operator !== 'undefined') {
                operator = thisUrl.query._operator.split(',');
                filter = filter + ' WHERE ';
                for (var i = 0; i < Object.keys(thisUrl.query).length; i++) {
                  if (Object.keys(thisUrl.query)[i] === '_operator') continue;
                  filter = `${filter}${Object.keys(thisUrl.query)[i]} LIKE '%${Object.values(thisUrl.query)[i]}%'`;
                  if (i !== Object.keys(thisUrl.query).length-1 && Object.keys(thisUrl.query)[i+1] !== '_operator') filter = filter + ` ${operator[i]} `;
                }
              }
              this.query(`SELECT ${data.idField}, ${data.titleField}, ${data.descField}, ` +
                  `${data.yearField} FROM ${data.table}${filter}`)
                  .then(rows => resolve(this.listTemplate(data, rows)))
                  .catch(err => console.log(err));
            } else {
              let body = '';
              data.request.on('data', chuck => {
                body = body + chuck.toString();
              });
              data.request.on('end', () => {
                body = this.#qs.parse(body);
                if (typeof body._attribute !== 'undefined') {
                  query = body.q;
                  attribute = body._attribute.split(',');
                  filter = filter + ' WHERE ';
                  for (var i = 0; i < attribute.length; i++) {
                    filter = `${filter}${attribute[i]} LIKE '%${query}%'`;
                    if (i !== attribute.length-1) filter = filter + ' OR ';
                  }
                } else if (typeof body._operator !== 'undefined') {
                  operator = body._operator.split(',');
                  filter = filter + ' WHERE ';
                  for (var i = 0; i < Object.keys(body).length; i++) {
                    if (Object.keys(body)[i] === '_operator') continue;
                    filter = `${filter}${Object.keys(body)[i]} LIKE '%${Object.values(body)[i]}%'`;
                    if (i !== Object.keys(body).length-1 && Object.keys(body)[i+1] !== '_operator') filter = filter + ` ${operator[i]} `;
                  }
                }
                this.query(`SELECT ${data.idField}, ${data.titleField}, ${data.descField}, ` +
                    `${data.yearField} FROM ${data.table}${filter}`)
                    .then(rows => resolve(this.listTemplate(data, rows)))
                    .catch(err => console.log(err));
              });
            }
          } else {
            this.query(`SELECT ${data.idField}, ${data.titleField}, ${data.descField}, ` +
                `${data.yearField} FROM ${data.table}`)
                .then(rows => resolve(this.listTemplate(data, rows)))
                .catch(err => console.log(err));
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