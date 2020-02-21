class Filter {
  #qs = require('querystring');
  #url = require('url');

  /** @template method */
  template(data) {
    this.setField(data);
    this.render((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  setField(data) {
    this.field = data;
    return this;
  }

  setRequest(data) {
    this.request = data;
    return this;
  }
  
  render(callback) {
    let template = ``;
    let thisUrl = this.#url.parse(this.request.url, true);
    if (typeof this.field === 'undefined') {
      callback(TypeError('setField(args) is undefined'), null);
    }
    if (typeof this.request === 'undefined') {
      callback(TypeError('setRequest(args) is undefined'), null);
    }
    if (typeof this.field !== 'object' || !Array.isArray(this.field)) {
      let typeError = 'args of setField(args) must be an objects in array';
      callback(TypeError(fieldTypeError), null);
    }
    for (var i = 0; i < this.field.length; i++) {
      if (!this.field[i].hasOwnProperty('field')) {
        callback(TypeError('One of property do not have field'));
      }
      if (!this.field[i].hasOwnProperty('type')) {
        callback(TypeError('One of property do not have type'));
      }
      if (!this.field[i].hasOwnProperty('label')) {
        this.request.label = this.request.value;
      }
      if (this.field[i].type === 'check') {
        if (!this.field[i].hasOwnProperty('value')) {
          callback(TypeError('Check type must have value property'));
        }
        if (typeof this.field[i].value !== 'object' ||
            !Array.isArray(this.field[i].value)) {
          callback(TypeError('Field of check type filter must be an array'));
        }
        template = this.filterCheck(template, i);
      }
      if (this.field[i].type === 'range') {
        template = this.filterRange(template, i);
      }
    }
    let urlQuery = thisUrl.search.substring(1);
    template = `
      ${template}
      <script>
        let append;
        load();
        function load() {
          let urlQuery = '${urlQuery}';
          let newValues = [];
          urlQuery = urlQuery.split('&');
          for (var i = 0; i < urlQuery.length; i++) {
            if (urlQuery[i].search(',') !== -1 &&
                !urlQuery[i].startsWith('_attribute')) {
              let objects = urlQuery[i].split('=');
              let values = objects[1].split(',');
              for (var j = 0; j < values.length; j++) {
                newValues.push(objects[0] + '=' + values[j])
              }
              urlQuery.splice(i, 1);
              i -= 1;
            }
          }
          urlQuery = urlQuery.concat(newValues);
          let check = document.getElementsByClassName('filterCheck');
          let range = document.getElementsByClassName('filterRange');
          for (var i = 0; i < check.length; i++) {
            let checks = check[i].children;
            let checkLength = check[i].children.length;
            for (var j = 1; j < checkLength; j++) {
              if (unescape(urlQuery)
                  .includes('_fc_' + checks[j].children[0].id)) {
                document.getElementById(checks[j].children[0].id).checked =
                    true;
              }
            }
          }
        }
        function direct(field, value = null) {
          let urlQuery = '${urlQuery}';
          let newValues = [];
          urlQuery = urlQuery.split('&');
          for (var i = 0; i < urlQuery.length; i++) {
            if (urlQuery[i].search(',') !== -1 &&
                !urlQuery[i].startsWith('_attribute')) {
              let objects = urlQuery[i].split('=');
              let values = objects[1].split(',');
              for (var j = 0; j < values.length; j++) {
                newValues.push(objects[0] + '=' + values[j])
              }
              urlQuery.splice(i, 1);
              i -= 1;
            }
          }
          urlQuery = urlQuery.concat(newValues);
          // console.log(document.getElementsByClassName(field));
          if (document.getElementsByClassName(field).length !== 0 &&
              document.getElementsByClassName(field)[0].id === '') {
            // let append = document.getElementsByClassName(id)[0].value;
          } else if (document.getElementById(field + '=' + value) !== null) {
            if (document.getElementById(field + '=' + value).checked) {
              append = '_fc_' + field + '=' + escape(value);
              urlQuery.push(append);
            } else {
              urlQuery.splice(urlQuery.indexOf(encodeURI('_fc_' + field + '=' + value)), 1);
            }
          }
          for (var i = 0; i < urlQuery.length; i++) {
            if (urlQuery[i].startsWith('_page')) urlQuery[i] = '_page=1';
            if (urlQuery[i].search(',') !== -1)
              urlQuery[i] = urlQuery[i].split(',');
          }
          urlQuery = urlQuery.join('&');
          location.replace('${thisUrl.pathname}' + '?' + urlQuery);
        }
      </script>
    `;
    callback(null, template);
  }

  filterCheck(template, i) {
    let l = this.field[i].label;
    let f = this.field[i].field;
    let v = this.field[i].value;
    template = `
      ${template}
      <div class='filterCheck'>
        <div><b>${l}:</b></div>
        ${Object.keys(v).map(i => `      
          <div>
            <input class='${f}' id='${f}=${v[i]}' type='checkbox' ` +
                `oninput='direct("${f}", "${v[i]}")' />
            <label for='${f}=${v[i]}'>${v[i]}</label>
          </div>
        `).join('')}
      </div>
    `;
    return template;
  }

  filterRange(template, i) {
    if (!this.field[i].hasOwnProperty('placeholder')) {
      this.field[i].placeholder = ['', ''];
    }
    let p = this.field[i].placeholder;
    let l = this.field[i].label;
    let f = this.field[i].field;
    template = `
      ${template}
      <div class='filterRange'>
        <div>
          <label for='${f}'>${l}</label>
        </div>
        <div>
          <input class='${f}' type='number' placeholder='${p[0]}' ` +
              `onfocusout='direct("${f}")'>
        </div>
        <div>
          <input class='${f}' type='number' placeholder='${p[1]}' ` + 
              `onfocusout='direct("${f}")'>
        </div>
      </div>
    `;
    return template;
  }
}

module.exports = Filter;