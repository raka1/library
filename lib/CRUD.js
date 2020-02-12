class CRUD {
  #mysql = require('mysql');
  #connection;
  hook = new CRUDHooking();

  constructor(config) {
    this.#connection = this.#mysql.createConnection(config);
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

  renderCRUD(callback) {
    this.getPrimaryKey((error, primary) => {
      if (error) callback(error, null);
      this.getAllData((error, allData) => {
        if (error) callback(error, null);
        this.primary = primary[0].Column_name;
        this.allData = allData;
        this.viewBook((error, data) => {
          if (error) callback(error, null);
          callback(null, data);
        });
      });
    })
  }

  addBook() {
    
  }

  viewBook(callback) {
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
    callback(null, template);
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