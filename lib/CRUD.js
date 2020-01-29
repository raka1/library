class CRUD {
  #mysql = require('mysql');
  #connection;
  hook = new CRUDHooking();

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

  setRequestData(data) {
    this.request = data;
    return this;
  }

  setTable(data) {
    this.table = data;
    return this;
  }

  getPrimaryKey() {
    return new Promise((resolve, reject) => {
      this.query(`SHOW KEYS FROM ${this.table} WHERE Key_name = 'PRIMARY'`)
          .then(rows => resolve(rows))
          .catch(err => console.log(err));
    });
  }

  getAllData() {
    return new Promise((resolve, reject) => {
      this.query(`SELECT * FROM ${this.table}`)
          .then(rows => resolve(rows))
          .catch(err => console.log(err));
    });
  }

  renderCRUD() {
    return new Promise((resolve, reject) => {
      this.getPrimaryKey()
          .then(primary => {
            this.getAllData()
                .then(allData => {
                  this.primary = primary[0].Column_name;
                  this.allData = allData;
                  this.viewBook()
                      .then(data => resolve(data))
                      .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
    });
  }

  addBook() {
    
  }

  viewBook() {
    return new Promise((resolve, reject) => {
      let id;
      if (typeof this.cssId !== 'undefined') {
        id = ` id = '${this.cssId}'`
      } else {
        id = '';
      }
      let template = `
        <style>
          .crud {
            border-collapse: collapse;
            width: 100%;
          }
          .crud td, .crud th {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .crud tr:nth-child(even){background-color: #f2f2f2;}
          .crud tr:hover {background-color: #ddd;}
          .crud th {
            padding-top: 12px;
            padding-bottom: 12px;
            background-color: #3498db;
            color: white;
          }
        </style>
        <table class='crud'>
          <thead>
            ${Object.keys(this.allData[0])
                .filter((index) => {
                  return index !== this.primary;
                }).map((index) => {
                  return `
                    <th>${index}</th>
                  `;
            }).join('')}
          <th>&nbsp</th>
          </thead>
          <tbody>
            ${Object.keys(this.allData).map((index) => {
              return `
                <tr>
                  ${Object.keys(this.allData[index])
                      .filter((index1) => {
                        return index1 !== this.primary;
                      }).map((index1) => {
                    return `
                      <td>${this.allData[index][index1]}</td>
                    `;
                  }).join('')}
                  <td>
                    <button class='crudDelete'>Hapus</button>
                    <button class='crudUpdate'>Ubah</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;

      resolve(template);
    });
  }

  editBook() {

  }

  removeBook() {

  }
}

/** @abstract */
class CRUDHook {
  /** @abstract */
  hook() {}
}

class CRUDHooking extends CRUDHook {
  hook() {}
}

module.exports = CRUD;