class CRUD {
  #mysql = require('mysql');
  #url = require('url');
  #qs = require('querystring');
  #connection;
  hook = new CRUDHooking();

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
  }

  /** @template method */
  template(data) {
    this.setRequest(data);
    this.setTable(data);
    this.getPrimaryKey(data);
    this.getAllData(data);
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

  setTable(data) {
    this.table = data;
    return this;
  }

  setForm(data) {
    this.form = data;
    return this;
  }

  setRequiredForm(data) {
    this.requiredForm = data;
    return this;
  }

  setView(data) {
    this.view = data;
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
    if (typeof this.table === 'undefined') {
      callback(TypeError('setTable(args) is undefined'), null);
    }
    if (typeof this.request === 'undefined') {
      callback(TypeError('setRequest(args) is undefined'), null);
    }
    this.thisUrl = this.#url.parse(this.request.url, true);
    if (this.thisUrl.query.action === 'add') {
      let body = '';
      this.request.on('data', data => {
        body += data;
        if (body.length > 1e6)
            this.request.connection.destroy();
      });
      this.request.on('end', () => {
        let post = this.#qs.parse(body);
        let data = `
          <script>
            window.location = '${this.thisUrl.pathname}';
          </script>
        `;
        if (post._token !== 'xF5Ls12lqp') callback(null, data);
        delete post._token;
        this.query(`INSERT INTO ` +
            `${this.table} (${Object.keys(post).join(',')}) VALUES ` +
            `('${Object.values(post).join('\',\'')}')`, (error, message) => {
          if (error) callback(error, null);
          callback(null, data);
        });
      });
    }
    if (this.thisUrl.query.action === 'edit') {
    }
    if (this.thisUrl.query.action === 'remove') {
      this.query(`DELETE FROM ${this.table} WHERE ${this.primary} =
          ${this.thisUrl.query.value}`, (error, message) => {
        if (error) callback(error, null);
        callback(null, message);
      });
    }
    this.getPrimaryKey((error, primary) => {
      if (error) callback(error, null);
      this.getAllData((error, allData) => {
        if (error) callback(error, null);
        this.primary = primary[0].Column_name;
        this.allData = allData;
        callback(null, crudTemplate());
      });
    })
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
                    .filter((index1) => index1 !== this.primary)
                    .map((index1) =>
                      `<td>${this.allData[index][index1]}</td>`)
                    .join('')}
                <td>
                  <button class='crudEdit'
                      onclick='edit(${this.allData[index][this.primary]})'>
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
            <form action="${this.thisUrl.pathname}?action=add" method='post'>
              ${Object.keys(this.allData[0])
                  .filter((index) => index !== this.primary)
                  .map((index) => 
                    `<input name='${index}' type="text"placeholder='${index}' />
                    <br />`)
                  .join('')}
              <input name='_token' type="text" value='xF5Ls12lqp' hidden='' />
              <button onclick='view()'>Back</button>
              <input name='file' type="file" />
              <input type='submit' value='Add' />
            </form>
          \`;
        }
        function view() {
          document.getElementById('crud').innerHTML = read;
        }
        function edit(data) {
          document.getElementById('crud').innerHTML = \`
            <form action="${this.thisUrl.pathname}?action=add" method='post'>
              ${Object.keys(this.allData[0])
                  .filter((index) => index !== this.primary)
                  .map((index) => 
                    `<input name='${index}' type="text"placeholder='${index}' />
                    <br />`)
                  .join('')}
              <input name='_token' type="text" value='xF5Ls12lqp' hidden='' />
              <button onclick='view()'>Back</button>
              <input type='submit' value='Add' />
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
  setScript() {}
  /** @abstract */
  setStyle() {}
}

class CRUDHooking extends CRUDHook {
  setStyle(data) {
    this.style = data;
    return this;
  }
}

module.exports = CRUD;