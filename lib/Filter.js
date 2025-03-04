class Filter {
  #url = require('url');

  /** @template method */
  template(data) {
    this.setField(data);
    this.render((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  setRequest(data) {
    this.request = data;
    return this;
  }

  setField(data) {
    this.field = data;
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
    let urlQuery;
    if (thisUrl.search === null) urlQuery = [];
    else urlQuery = thisUrl.search.substring(1);
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
                urlQuery[i].startsWith('_fc_')) {
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
          for (var i = 0; i < range.length; i++) {
            let ranges = range[i].children;
            let rangeLength = range[i].children.length;
            for (var i = 0; i < urlQuery.length; i++) {
              if (urlQuery[i].startsWith('_fr_' + ranges[1].firstElementChild.className)) {
                let objects = urlQuery[i].split('=');
                let values = objects[1].split(',');
                ranges[1].firstElementChild.value = values[0];
                ranges[2].firstElementChild.value = values[1];
              }
            }
          }
        }
        function isNumber(evt, field) {
          let charCode = (evt.which) ? evt.which : event.keyCode;
          if (charCode === 13) direct(field);
          if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
          return true;
        }
        function direct(field, value = null) {
          let urlQuery = '${urlQuery}';
          let newValues = [];
          urlQuery = urlQuery.split('&');
          for (var i = 0; i < urlQuery.length; i++) {
            if (urlQuery[i].search(',') !== -1 &&
                urlQuery[i].startsWith('_fc_')) {
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
          if (document.getElementsByClassName(field).length !== 0 &&
              document.getElementsByClassName(field)[0].id === '') {
            let onKeyDown = [];
            value = [];
            value[0] = document.getElementsByClassName(field)[0].value;
            value[1] = document.getElementsByClassName(field)[1].value;
            if (parseInt(value[0]) > parseInt(value[1])) {
              let temp = value[0];
              value[0] = value[1];
              value[1] = temp;
            }
            append = '_fr_' + field + '=' + escape(value[0]) + ',' + escape(value[1]);
            if (value[0] !== '' || value[1] !== '') {
              for (var i = 0; i < urlQuery.length; i++) {
                if (urlQuery[i].startsWith('_fr_' + field)) {
                  urlQuery[i] = append;
                  break;
                }
                if (i+1 === urlQuery.length) {
                  urlQuery.push(append);
                }
              }
            }
            if (value[0] === '' && value[1] === '') {
              for (var i = 0; i < urlQuery.length; i++) {
                if (urlQuery[i].search(',') !== -1 &&
                    urlQuery[i].startsWith('_fr_' + field)) {
                  urlQuery.splice(i, 1);
                  i -= 1;
                }
              }
            }
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
      <style>
        .filterCheck {
          margin-bottom: 4px;
        }
      </style>
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
      <style>
      .filterRange {
        margin-bottom: 4px;
      }
        .filterRange input[type=text] {
          width: 130px;
          box-sizing: border-box;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          background-color: white;
          padding: 12px 20px 12px 20px;
          transition: width 0.4s ease-in-out;
        }
      </style>
      <div class='filterRange'>
        <div>
          <label for='${f}'><b>${l}:</b></label>
        </div>
        <div>
          <input class='${f}' type='text' ` +
              `onkeypress='return isNumber(event, "${f}")' ` +
              `placeholder='${p[0]}' />
        </div>
        <div>
          <input class='${f}' type='text' ` + 
              `onkeypress='return isNumber(event, "${f}")' ` +
              `placeholder='${p[1]}' />
        </div>
      </div>
    `;
    return template;
  }
}

module.exports = Filter;