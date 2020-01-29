/** @abstract */
class Search {
  hook = new SearchHooking();

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

  renderMultiSearch() {
    return new Promise((resolve, reject) => {
      let submit;
      let operator = '';
      if (typeof this.hook.submit !== 'undefined') {
        submit = ` value = '${this.hook.submit}'`
      } else {
        submit = ' value = Search';
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
      if (typeof this.hook.placeholder === 'undefined') {
        this.hook.placeholder = {}
      }
      resolve(`
        <form class='multiSearch' action='${this.target}' method='get'>
          ${Object.keys(this.field).map((index) => {
            return `
              <input name='${this.field[index]}' type='text' ` +
                  `placeholder='${this.hook.placeholder[index]}'/>
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
      let placeholder;
      let submit;
      if (typeof this.hook.placeholder !== 'undefined') {
        placeholder = ` placeholder = '${this.hook.placeholder}'`
      } else {
        placeholder = '';
      }
      if (typeof this.hook.submit !== 'undefined') {
        submit = ` value = '${this.hook.submit}'`
      } else {
        submit = ' value = Search';
      }
      resolve(`
        <form class='singleSearch' action='${this.target}' method='get'>
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
  setSubmit() {}
  setPlaceholder() {}
}

class SearchHooking extends SearchHook {
  setSubmit(data) {
    this.submit = data;
    return this;
  }

  setPlaceholder(data) {
    this.placeholder = data;
    return this;
  }
}

module.exports = Search;