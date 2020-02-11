/** @abstract */
class DocServe {
  #url = require('url');
  #mysql = require('mysql');
  #connection;
  hook = new DocServeHooking();

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  template(data) {
    this.setIdField(data);
    this.setField(data);
    this.setTarget(data);
    this.setTable(data);
    this.renderListView()
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
   
  setRequestData(data) {
    this.request = data;
    return this;
  }
   
  setIdField(data) {
    this.idField = data;
    return this;
  }

  setField(data) {
    this.field = data;
    return this;
  }

  setTarget(data) {
    this.target = data;
    return this;
  }

  setTable(data) {
    this.table = data;
    return this;
  }

  renderListView() {
    return new Promise((resolve, reject) => {
      if (typeof this.idField === 'undefined') {
        reject('Render view list error: setIdField(args) is undefined.');
      }
      if (typeof this.field === 'undefined') {
        reject('Render view list error: setField(args) is undefined.');
      }
      if (typeof this.target === 'undefined') {
        reject('Render view list error: setTarget(args) is undefined.');
      }
      if (typeof this.table === 'undefined') {
        reject('Render view list error: setTable(args) is undefined.');
      }
      let thisUrl = this.#url.parse(this.request.url, true);
      let field = '';
      if (typeof thisUrl.query._page === 'undefined' ||
          thisUrl.query._page === '')
        thisUrl.query._page = 1;
      if (typeof this.hook.maxPerPage === 'undefined')
        this.hook.maxPerPage = 20;
      for (var i = 0; i < this.field.length; i++) {
        field = field + this.field[i];
        if (i !== this.field.length-1) field = field + ',';
      }
      if (this.request !== 'undefined') {
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
        this.query(`SELECT ${this.idField}, ${this.field} FROM ` +
            `${this.table}${filter} LIMIT ` +
            `${(thisUrl.query._page-1)*this.hook.maxPerPage}, ` +
            `${this.hook.maxPerPage}`)
            .then(rows => {
              this.query(`SELECT ${this.idField}, ${field} FROM ` +
                  `${this.table}${filter}`)
                  .then(rowsAll =>
                    resolve(this.listTemplate(rows, rowsAll))
                  )
                  .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
      } else {
        this.query(`SELECT ${this.idField}, ${field} LIMIT ` +
            `${(thisUrl.query._page-1)*this.hook.maxPerPage}, ` +
            `${this.hook.maxPerPage}`)
            .then(rows => {
              this.query(`SELECT ${this.idField}, ${field} FROM ${this.table}`)
                  .then(rowsAll =>
                    resolve(this.listTemplate(rows, rowsAll))
                  )
                  .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
      }
    });
  }

  listTemplate(rows, rowsAll) {
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
      ${Object.keys(rows).map(index => {
        return `
          <div class='listView'>
            <div>
              <a href="/${this.target}/${rows[index][this.idField]}">
                ${rows[index][this.field[0]]}
              </a>
            </div>
            ${Object.keys(this.field).filter(index1 => {
              return index1 != 0
            }).map(index1 => {
              return `
                <div>${rows[index][this.field[index1]]}</div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    `;
    let thisUrl = this.#url.parse(this.request.url, true);
    let queryParams = `${thisUrl.pathname}?`;
    let i = 0;
    let page = Math.ceil(rowsAll.length/this.hook.maxPerPage);
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
      if (thisUrl.query._page == i+1) {
        template = `${template}<span>${i+1}</span>`;
      } else {
        template = `${template}<span><a href="${queryParams}&_page=${i+1}">` +
        `${i+1}</a></span>`;
      }
    }
    template = `${template}</div>`;

    return template;
  }
}

/** @abstract */
class DocServeHook {
  /** @abstract */
  setMaxPerPage() {}
}

class DocServeHooking extends DocServeHook {
  setMaxPerPage(data) {
    this.maxPerPage = data;
    return this;
  }
}

module.exports = DocServe;