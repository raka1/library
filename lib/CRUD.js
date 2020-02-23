class CRUD {
  #mysql = require('mysql');
  #url = require('url');
  #qs = require('querystring');
  #fs = require('fs');
  #formidable = require('formidable');
  #path = require('path');
  #connection;
  #util = require('util');
  hook = new CRUDHooking();

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  template(data) {
    this.setRequest(data);
    this.setTable(data);
    this.setBookField(data);
    this.setForm(data);
    this.setDir(data);
    this.renderCRUD((error, data) => {
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

  setResponse(data) {
    this.response = data;
    return this;
  }

  setBookField(data) {
    this.bookField = data;
    return this;
  }

  setForm(data) {
    this.form = data;
    return this;
  }

  setDir(data) {
    this.dir = data;
    return this;
  }

  setTable(data) {
    this.table = data;
    return this;
  }

  getPrimaryKey(callback) {
    this.query(`SHOW KEYS FROM ${this.table} WHERE Key_name = 'PRIMARY'`,
        (error, rows) => {
      if (error) callback(error, null);
      callback(null, rows)
    });
  }

  getAllData(callback) {
    this.query(`SELECT * FROM ${this.table}`, (error, rows) => {
      if (error) callback(error, null)
      callback(null, rows);
    });
  }

  render(callback) {
    if (typeof this.request === 'undefined') {
      callback(TypeError('setRequest(args) is undefined'), null);
    }
    if (typeof this.bookField === 'undefined') {
      callback(TypeError('setBookField(args) is undefined'), null);
    }
    if (typeof this.form === 'undefined') {
      callback(TypeError('setForm(args) is undefined'), null);
    }
    if (typeof this.dir === 'undefined') {
      callback(TypeError('setDir(args) is undefined'), null);
    }
    if (typeof this.table === 'undefined') {
      callback(TypeError('setTable(args) is undefined'), null);
    }
    this.thisUrl = this.#url.parse(this.request.url, true);
    if (this.thisUrl.query.action === 'add') {
      let form = new this.#formidable.IncomingForm();
      form.parse(this.request, (error, fields, files) => {
        if (error) console.log(error);
        let data = `
          <script>
            window.location = '${this.thisUrl.pathname}';
          </script>
        `;
        if (fields._token !== 'xF5Ls12lqp') callback(null, data);
        let post = fields;
        delete post._token;
        let oldPath = this.#path.normalize(files[this.bookField].path);
        let newPath = this.#path.normalize(__dirname + '/../../../' + this.dir +
            '/' + files[this.bookField].name);
        if (typeof this.errorUploadIfExists === 'undefined')
          this.errorUploadIfExists = 'File is already exists';
        if (this.#fs.existsSync(newPath)) 
          callback(TypeError(this.errorUploadIfExists),
              this.errorUploadIfExists);
        if (!this.#fs.existsSync(newPath)) {
          this.query(`INSERT INTO ` +
              `${this.table} (${Object.keys(post).join(',')}, ` +
              `${this.bookField}) VALUES ` +
              `('${Object.values(post).join('\',\'')}', ` +
              `'${files[this.bookField].name}')`, (error, message) => {
            if (error) callback(error, null);
            this.#fs.renameSync(oldPath, newPath);
            callback(null, data);
          });
        }
      });
    }
    if (this.thisUrl.query.action === 'edit') {
      let form = new this.#formidable.IncomingForm();
      form.parse(this.request, (error, fields, files) => {
        if (error) console.log(error);
        let data = `
          <script>
            window.location = '${this.thisUrl.pathname}';
          </script>
        `;
        if (fields._token !== 'xF5Ls12lqp') callback(null, data);
        let post = fields;
        let _id = post._id;
        let set = 'SET ';
        delete post._token;
        delete post._id;
        for (var i = 0; i < Object.keys(post).length; i++) {
          if (i !== 0) set += ', ';
          set += Object.keys(post)[i] + ' = \'' + Object.values(post)[i] + '\'';
        }
        this.query(`UPDATE ${this.table} ${set} WHERE ` +
            `${this.primary} = '${_id}'`, (error, message) => {
          if (error) callback(error, null);
          callback(null, data);
        });
      });
    }
    if (this.thisUrl.query.action === 'remove') {
      this.query(`SELECT ${this.bookField} FROM ${this.table} WHERE ` +
          `${this.primary} = ${this.thisUrl.query.value}`, (error, data) => {
        if (error) callback(error, null);
        this.#fs.unlinkSync(this.#path.normalize(__dirname + '/../../../' +
            this.dir + '/' + data[0][this.bookField]));
        this.query(`DELETE FROM ${this.table} WHERE ${this.primary} = ` +
            `${this.thisUrl.query.value}`, (error, message) => {
          if (error) callback(error, null);
          callback(null, message);
        });
      });
    }
    if (this.thisUrl.query.action === 'openfile') {
      this.#fs.readFile(this.#path.normalize(__dirname + '/../../../' +
            this.dir + '/' + this.thisUrl.query.file), (error, content) => {
        if (error) callback(error, null);
        this.response.end(content);
      });
    }
    if (this.thisUrl.path !== '/admin?action=add' &&
      this.thisUrl.path !== '/admin?action=edit' &&
      this.thisUrl.path !== '/admin?action=remove' &&
      this.thisUrl.query.action !== 'openfile') {
      this.getPrimaryKey((error, primary) => {
        if (error) callback(error, null);
        this.getAllData((error, allData) => {
          if (error) callback(error, null);
          this.primary = primary[0].Column_name;
          this.allData = allData;
          callback(null, this.crudTemplate());
        });
      })
    }
  }

  crudTemplate() {
    let id;
    if (typeof this.cssId !== 'undefined') {
      id = ` id = '${this.cssId}'`
    } else {
      id = '';
    }
    if (typeof this.hook.style === 'undefined') this.hook.style = '';
    if (typeof this.hook.script === 'undefined') this.hook.script = '';
    let template = `
      <style>
        #crud {
          border-collapse: collapse;
          width: 100%;
        }
        .crud td, .crud th {
          border: 1px solid #ddd;
          padding: 8px;
        }
        #crud tr:nth-child(even){background-color: #f2f2f2;}
        #crud tr:hover {background-color: #ddd;}
        #crud th {
          padding-top: 12px;
          padding-bottom: 12px;
          background-color: #7f8c8d;
          color: white;
        }
        ${this.hook.style}
      </style>
      <div id='crud'>
        <button class='crudAdd' onclick='add()'>Add more</button>
        <input id='crudSearch' type="text" oninput='search()'
            placeholder='Search...' />
        <table id='crudTable'>
          <thead>
            ${Object.keys(this.allData[0])
                .filter((index) => index !== this.primary)
                .map((index) => `<th>${index}</th>`)
                .join('')}
          <th>&nbsp</th>
          </thead>
          <tbody>
            ${Object.keys(this.allData).map((index) => `
              <tr>
                ${Object.keys(this.allData[index])
                    .filter((index1) => index1 !== this.primary &&
                        index1 !== this.bookField)
                    .map((index1) =>
                      `<td>${this.allData[index][index1]}</td>`)
                    .join('')}
                <td><a href='${this.thisUrl.pathname}?action=openfile&` +
                    `file=${this.allData[index][this.bookField]}'>` +
                    `${this.allData[index][this.bookField]}</a></td>
                <td>
                  <button class='crudEdit' onclick='edit(${index}, ` +
                      `${this.allData[index][this.primary]})'>
                    Update
                  </button>
                  <button class='crudRemove'
                      onclick='remove(${this.allData[index][this.primary]})'>
                    Delete
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <script>
        let xhttp = new XMLHttpRequest();
        let read = document.getElementById('crud').innerHTML;
        function add() {
          document.getElementById('crud').innerHTML = \`
            <form action="${this.thisUrl.pathname}?action=add" method='post' ` +
                `enctype="multipart/form-data">
              ${Object.keys(this.form)
                  .map((index) => `
                    <div>
                    <input name='${this.form[index]}' autocomplete='off'` +
                        `type="text"placeholder='${this.form[index]}' />
                    </div>
                  `).join('')}
              <div><input name='${this.bookField}' type="file" ` +
                  `accept='application/pdf' required /></div>
              <div>
                <input name='_token' type="text" value='xF5Ls12lqp' hidden='' />
              </div>
              <button onclick='view()'>Back</button>
              <input type='submit' value='Add' />
            </form>
          \`;
        }
        function view() {
          document.getElementById('crud').innerHTML = read;
        }
        function edit(index, id) {
          let allData = '${JSON.stringify(this.allData)}';
          allData = JSON.parse(allData);
          let data = allData[index];
          document.getElementById('crud').innerHTML = \`
            <form action="${this.thisUrl.pathname}?action=edit" method='post'>
              ${Object.keys(this.form)
                  .map((index) => `
                    <div>
                    <input name='${this.form[index]}' type="text" ` +
                        `placeholder='${this.form[index]}' autocomplete='off'` +
                        ` value='\${data.${this.form[index]}}' />
                    </div>
                  `).join('')}
              <div>
                <input name='_id' type="text" value='\${id}' hidden='' />
                <input name='_token' type="text" value='xF5Ls12lqp' hidden='' />
              </div>
              <button onclick='view()'>Back</button>
              <input type='submit' value='Update' />
            </form>
          \`;
        }
        function remove(data) {
          let x = confirm('Delete this record?');
          if (x) {
            xhttp.open('DELETE',
                '${this.thisUrl.pathname}?action=remove&value=' + data, true);
            xhttp.onreadystatechange = function() {
              if (xhttp.readyState == 4 && xhttp.status == 200) {
                location.reload();
              }
            }
            xhttp.send();
          }
        }
        function search() {
          let data = document.getElementById('crudTable').children[1].children;
          for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < data[i].children.length; j++) {
              if (data[i].children[j].innerHTML.toUpperCase()
                  .search(document.getElementById('crudSearch')
                  .value.toUpperCase()) !== -1) {
                data[i].style.display = '';
                break;
              } else {
                data[i].style.display = 'none';
              }
            };
          }
        }
      </script>
    `;
    return template;
  }
}

/** @abstract */
class CRUDHook {
  /** @abstract */
  setErrorFileUpload() {}
}

class CRUDHooking extends CRUDHook {
  setErrorUploadIfExists(data) {
    this.errorUploadIfExists = data;
    return this;
  }
}

module.exports = CRUD;