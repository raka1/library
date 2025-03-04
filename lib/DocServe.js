/** @abstract */
class DocServe {
  #url = require('url');
  #mysql = require('mysql');
  #qs = require('querystring');
  #path = require('path');
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
    this.renderListView((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  query(sql, callback) {
    this.#connection.query(sql, (error, rows) => {
      if (error) callback(error, null);
      callback(null, rows);
    });
  }
   
  setRequest(data) {
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

  render(callback) {
    if (typeof this.request === 'undefined') {
      callback(TypeError('setRequest(args) is undefined'), null);
    }
    if (typeof this.idField === 'undefined') {
      callback(TypeError('setIdField(args) is undefined'), null);
    }
    if (typeof this.field === 'undefined') {
      callback(TypeError('setField(args) is undefined'), null);
    }
    if (typeof this.target === 'undefined') {
      callback(TypeError('setTarget(args) is undefined'), null);
    }
    if (typeof this.table === 'undefined') {
      callback(TypeError('setTable(args) is undefined'), null);
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
    let query;
    let attribute;
    let operator;
    let filter = '';
    // single search
    if (typeof thisUrl.query._attribute !== 'undefined') {
      query = thisUrl.query.q;
      attribute = thisUrl.query._attribute.split(',');
      filter = filter + ' WHERE (';
      for (var i = 0; i < attribute.length; i++) {
        if (i !== 0) filter = `${filter} OR `;
        filter = `${filter}${attribute[i]} LIKE '%${query}%'`;
      }
      filter = filter + ')';
      for (var i = 2; i < Object.keys(thisUrl.query).length; i++) {
        if (Object.keys(thisUrl.query)[i] === '_page') continue;
        if (Object.keys(thisUrl.query)[i].startsWith('_fc_')) {
          let cut = Object.keys(thisUrl.query)[i].replace('_fc_', '');
          let value = Object.values(thisUrl.query)[i];
          filter = `${filter} AND `;
          if (typeof value === 'string') {
            value = value.split(',');
            if (value.length === 1) {
              value = value[0];
            }
          }
          if (typeof value === 'object' &&
              Array.isArray(value)) {
            filter = `${filter}(`
            for (var j = 0; j < value.length; j++) {
              if (j !== 0) filter = `${filter} OR `;
              filter = `${filter}${cut} = '${value[j]}'`; 
            }
            filter = `${filter})`;
          } else {
            filter = `${filter}${cut} = '${value}'`;
          }
        }
        if (Object.keys(thisUrl.query)[i].startsWith('_fr_')) {
          let cut = Object.keys(thisUrl.query)[i].replace('_fr_', '');
          let value = Object.values(thisUrl.query)[i];
          filter = `${filter} AND `;
          value = value.split(',');
          if (value[0] === '' && value[1] !== '')
            filter = `${filter}${cut} <= ${value[1]}`;
          if (value[0] !== '' && value[1] === '')
            filter = `${filter}${cut} >= ${value[0]}`;
          if (value[0] !== '' && value[1] !== '')
            filter = `${filter}(${cut} >= ${value[0]} AND ${cut} <= ${value[1]})`;
        }
      }
    // multi search
    } else if (typeof thisUrl.query._operator !== 'undefined') {
      operator = thisUrl.query._operator.split(',');
      filter = filter + ' WHERE ';
      let pureI = 0;
      for (var i = 0; i < Object.keys(thisUrl.query).length; i++) {
        if (Object.keys(thisUrl.query)[i] === '_operator') continue;
        if (Object.keys(thisUrl.query)[i] === '_page') continue;
        if (Object.keys(thisUrl.query)[i].startsWith('_fc_')) {
          let cut = Object.keys(thisUrl.query)[i].replace('_fc_', '');
          let value = Object.values(thisUrl.query)[i];
          filter = `${filter} AND `;
          if (typeof value === 'string') {
            value = value.split(',');
            if (value.length === 1) {
              value = value[0];
            }
          }
          if (typeof value === 'object' &&
              Array.isArray(value)) {
            filter = `${filter}(`
            for (var j = 0; j < value.length; j++) {
              if (j !== 0) filter = `${filter} OR `;
              filter = `${filter}${cut} = '${value[j]}'`; 
            }
            filter = `${filter})`
          } else {
            filter = `${filter}${cut} = '${value}'`;
          }
          continue;
        }
        if (Object.keys(thisUrl.query)[i].startsWith('_fr_')) {
          let cut = Object.keys(thisUrl.query)[i].replace('_fr_', '');
          let value = Object.values(thisUrl.query)[i];
          filter = `${filter} AND `;
          value = value.split(',');
          if (value[0] === '' && value[1] !== '')
            filter = `${filter}${cut} <= ${value[1]}`;
          if (value[0] !== '' && value[1] === '')
            filter = `${filter}${cut} >= ${value[0]}`;
          if (value[0] !== '' && value[1] !== '')
            filter = `${filter}(${cut} >= ${value[0]} AND `
                `${cut} <= ${value[1]})`;
          continue;
        }
        if (pureI !== 0) filter = filter + ` ${operator[pureI-1]} `;
        filter = `${filter}${Object.keys(thisUrl.query)[i]} LIKE ` +
        `'%${Object.values(thisUrl.query)[i]}%'`;
        pureI += 1;
      }
    // non search
    } else {
      let whereFlag = 0;
      let opFlag = 0;
      for (var i = 0; i < Object.keys(thisUrl.query).length; i++) {
        if (Object.keys(thisUrl.query)[i] === '_page') continue;
        if (Object.keys(thisUrl.query)[i].startsWith('_fc_')) {
          if (whereFlag === 0) {
            filter = `${filter} WHERE `;
            whereFlag = 1;
          }
          if (opFlag === 1) filter = `${filter} AND `;
          if (opFlag === 0) opFlag = 1;
          let cut = Object.keys(thisUrl.query)[i].replace('_fc_', '');
          let value = Object.values(thisUrl.query)[i];
          if (typeof value === 'string') {
            value = value.split(',');
            if (value.length === 1) {
              value = value[0];
            }
          }
          if (typeof value === 'object' &&
              Array.isArray(value)) {
            filter = `${filter}(`
            for (var j = 0; j < value.length; j++) {
              if (j !== 0) filter = `${filter} OR `;
              filter = `${filter}${cut} = '${value[j]}'`; 
            }
            filter = `${filter})`
          } else {
            filter = `${filter}${cut} = '${value}'`;
          }
        }
        if (Object.keys(thisUrl.query)[i].startsWith('_fr_')) {
          if (whereFlag === 0) {
            filter = `${filter} WHERE `;
            whereFlag = 1;
          }
          if (opFlag === 1) filter = `${filter} AND `;
          if (opFlag === 0) opFlag = 1;
          let cut = Object.keys(thisUrl.query)[i].replace('_fr_', '');
          let value = Object.values(thisUrl.query)[i];
          value = value.split(',');
          if (value[0] === '' && value[1] !== '')
            filter = `${filter}${cut} <= ${value[1]}`;
          if (value[0] !== '' && value[1] === '')
            filter = `${filter}${cut} >= ${value[0]}`;
          if (value[0] !== '' && value[1] !== '')
            filter = `${filter}(${cut} >= ${value[0]} AND ` +
                `${cut} <= ${value[1]})`;
        }
      }
    }
    this.query(`SELECT ${this.idField}, ${this.field} FROM ` +
        `${this.table}${filter} LIMIT ` +
        `${(thisUrl.query._page-1)*this.hook.maxPerPage}, ` +
        `${this.hook.maxPerPage}`, (error, rows) => {
      if (error) callback(error, null);
      this.query(`SELECT ${this.idField}, ${field} FROM ` +
        `${this.table}${filter}`, (error, rowsAll) => {
          if (error) callback(error, null)
          callback(null, this.listTemplate(rows, rowsAll))
      });
    });
  }

  listTemplate(rows, rowsAll) {
    if (typeof this.hook.prefix === 'undefined') this.hook.prefix = [];
    if (typeof this.hook.suffix === 'undefined') this.hook.suffix = [];
    for (var i = 0; i < this.field.length; i++) {
      if (typeof this.hook.prefix[i] === 'undefined') this.hook.prefix[i] = '';
      if (this.hook.prefix[i] === null) this.hook.prefix[i] = '';
      if (typeof this.hook.suffix[i] === 'undefined') this.hook.suffix[i] = '';
      if (this.hook.suffix[i] === null) this.hook.suffix[i] = '';
    }
    if (typeof this.hook.emptyMessage === 'undefined')
      this.hook.emptyMessage = 'Can not find any data.';
    if (Object.keys(rows).length !== 0) this.hook.emptyMessage = '';
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
      <hr>
      ${this.hook.emptyMessage}
      ${Object.keys(rows).map(index => `
        <div class='listView'>
          <div>
            <a href="${this.#path.posix
                .normalize(`/${this.target}/${rows[index][this.idField]}`)}">
              ${rows[index][this.field[0]]}
            </a>
          </div>
          ${Object.keys(this.field)
              .filter(index1 => index1 != 0)
              .map(index1 => `
            <div>
              ${this.hook.prefix[index1-1]}
              ${rows[index][this.field[index1]]}
              ${this.hook.suffix[index1-1]}
            </div>
          `).join('')}
        </div>
      `).join('')}
    `;
    let thisUrl = this.#url.parse(this.request.url, true);
    let page = Math.ceil(rowsAll.length/this.hook.maxPerPage);
    if (typeof thisUrl.query._page === 'undefined' ||
        thisUrl.query._page === '')
      thisUrl.query._page = 1;
    template = `
      ${template}
      <style>
        .pagination {
          word-wrap: break-word;
          margin-bottom: 10px;
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
      <div class='pagination'>
    `;
    let tempQuery = Object.assign({}, thisUrl.query);
    // template = `${template}<hr>`;
    for (let i = 0; i < page; i++) {
      if (thisUrl.query._page == i+1) {
        template = `${template}<span>${i+1}</span>`;
      } else {
        tempQuery._page = i+1;
        let queryParams = this.#qs
            .stringify(tempQuery, null, null, {encodeURIComponent: uri => uri});
        template = `${template}<span><a href="${thisUrl.pathname}?` +
        `${queryParams}">${i+1}</a></span>`;
      }
    }
    template = `${template}<hr></div>`;

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

  setEmptyMessage(data) {
    this.emptyMessage = data;
    return this;
  }

  setAffix(prefix, suffix) {
    this.prefix = prefix;
    this.suffix = suffix;
    return this;
  }
}

module.exports = DocServe;