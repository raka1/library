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

  listTemplate(data, rows, rowsAll) {
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
    let thisUrl = this.#url.parse(data.request.url, true);
    let queryParams = `${thisUrl.pathname}?`;
    let i = 0;
    let page = Math.ceil(rowsAll.length/data.maxPerPage);
    if (typeof thisUrl.query._page === 'undefined' ||
        thisUrl.query._page === '')
      thisUrl.query._page = 1;
    template = `
      ${template}
      <style>
        .pagination {
          word-wrap: break-word;
        }
        .pagination a {
          color: #3498db;
          text-decoration: none;
        }
        .pagination span {
          margin-right: 5px;
        }
        .pagination a:hover {
          text-decoration: underline;
        }
      </style>
      <div class='pagination'>`;
    for (let [property, value] of Object.entries(thisUrl.query)) {
      i++;
      if (property === '_page') {
        if (i === Object.keys(thisUrl.query).length) {
          queryParams = queryParams.slice(0, -1);
          break;
        }
        continue;
      }
      queryParams = `${queryParams}${property}=${thisUrl.query[property]}`;
      if (i === Object.keys(thisUrl.query).length) {
        break;
      } else {
        queryParams = `${queryParams}&`
      }
    }
    for (i = 0; i < page; i++) {
      if (thisUrl.query._page === i+1) {
        template = `${template}<span>${i+1}</span>`;
      } else {
        template = `${template}<span><a href="${queryParams}&_page=${i+1}">` +
        `${i+1}</a></span>`;
      }
    }
    template = `${template}</div>`;

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
          let thisUrl = this.#url.parse(data.request.url, true);
          if (typeof thisUrl.query._page === 'undefined' ||
              thisUrl.query._page === '')
            thisUrl.query._page = 1;
          if (typeof data.maxPerPage === 'undefined') data.maxPerPage = 20;
          if (data.hasOwnProperty('request')) {
            let query;
            let attribute;
            let operator;
            let filter = '';
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
                if (Object.keys(thisUrl.query)[i] === '_page') continue;
                filter = `${filter}${Object.keys(thisUrl.query)[i]} LIKE ` +
                `'%${Object.values(thisUrl.query)[i]}%'`;
                if (i !== Object.keys(thisUrl.query).length-1 &&
                    Object.keys(thisUrl.query)[i+1] !== '_operator')
                  filter = filter + ` ${operator[i]} `;
              }
            }
            this.query(`SELECT ${data.idField}, ${data.titleField}, ` +
                `${data.descField}, ${data.yearField} FROM ` +
                `${data.table}${filter} LIMIT ` +
                `${(thisUrl.query._page-1)*data.maxPerPage}, ` +
                `${data.maxPerPage}`)
                .then(rows => {
                  this.query(`SELECT ${data.idField}, ${data.titleField}, ` +
                      `${data.descField}, ${data.yearField} FROM ` +
                      `${data.table}${filter}`)
                      .then(rowsAll =>
                        resolve(this.listTemplate(data, rows, rowsAll))
                      )
                      .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
          } else {
            this.query(`SELECT ${data.idField}, ${data.titleField}, ` +
                `${data.descField}, ${data.yearField} FROM ` +
                `${data.table} LIMIT ` +
                `${(thisUrl.query._page-1)*data.maxPerPage}, ` +
                `${data.maxPerPage}`)
                .then(rows => {
                  this.query(`SELECT ${data.idField}, ${data.titleField}, ` +
                      `${data.descField}, ${data.yearField} FROM ${data.table}`)
                      .then(rowsAll =>
                        resolve(this.listTemplate(data, rows, rowsAll))
                      )
                      .catch(err => console.log(err));
                })
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