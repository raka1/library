/** @abstract */
class Search {
  /** @template method */
  templateMulti(data) {
    this.setTarget(data);
    this.setField(data);
    this.setOperator(data);
    this.renderMultiSearch(data) 
        .then(data => data)
        .catch(err => console.log(err));
  }

  /** @template method */
  templateSingle(data) {
    this.setTarget(data);
    this.setAttribute(data);
    this.renderSearch(data)  
        .then(data => data)
        .catch(err => console.log(err));
  }

  setTarget(data) {
    this.target = data;
    return this;
  }

  setField(data) {
    this.field = data;
    return this;
  }

  setAttribute(data) {
    this.attribute = data;
    return this;
  }

  setOperator(data) {
    this.operator = data;
    return this;
  }

  setCssId(data) {
    this.cssId = data;
    return this;
  }

  setCssSubmit(data) {
    this.cssSubmit = data;
    return this;
  }

  setCssPlaceholder(data) {
    this.cssPlaceholder = data;
    return this;
  }

  renderMultiSearch() {
    return new Promise((resolve, reject) => {
      let id;
      let submit;
      let operator = '';
      if (typeof this.cssId !== 'undefined') {
        id = ` id = '${this.cssId}'`
      } else {
        id = '';
      }
      if (typeof this.cssSubmit !== 'undefined') {
        submit = ` value = '${this.cssSubmit}'`
      } else {
        submit = '';
      }
      if (typeof this.operator !== 'undefined') {
        for (var i = 0; i < this.field.length-1; i++) {
          if (this.operator[i] === undefined)
            this.operator[i] = 'or';
          operator = operator + this.operator[i];
          if (i+1 !== this.field.length-1) operator = operator + ',';
        }
      } else {
        for (var i = 0; i < this.field.length-1; i++) {
          operator = operator + 'or';
          if (i+1 !== this.field.length-1) operator = operator + ',';
        }
      }
      if (typeof this.cssPlaceholder === 'undefined') {
        this.cssPlaceholder = {}
      }
      resolve(`
        <form action='${this.target}' method='get'${id}>
          ${Object.keys(this.field).map((index) => {
            return `
              <input name='${this.field[index]}' type='text' ` +
                  `placeholder='${this.cssPlaceholder[index]}'/>
            `
          }).join('')}
          <input name='_operator' type='text' value='${operator}' hidden/>
          <input type='submit'${submit} />
        </form>
      `);
    });
  }

  renderSearch() {
    return new Promise((resolve, reject) => {
      let id;
      let placeholder;
      let submit;
      if (typeof this.cssId !== 'undefined') {
        id = ` id = '${this.cssId}'`
      } else {
        id = '';
      }
      if (typeof this.cssPlaceholder !== 'undefined') {
        placeholder = ` placeholder = '${this.cssPlaceholder}'`
      } else {
        placeholder = '';
      }
      if (typeof this.cssSubmit !== 'undefined') {
        submit = ` value = '${this.cssSubmit}'`
      } else {
        submit = '';
      }
      resolve(`
        <form action='${this.target}' method='get'${id}>
          <input name='q' type='text'${placeholder} />
          <input name='_attribute' type='text' ` +
              `value='${this.attribute}' hidden autocomplete="off" />
          <input type='submit'${submit} />
        </form>
      `);
    });
  }
}

class SearchHook {
  hook() {}
}

exports.Search = Search;
exports.SearchHook = SearchHook;