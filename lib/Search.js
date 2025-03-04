/** @abstract */
class Search {
  hook = new SearchHooking();

  /** @template method */
  templateMulti(data) {
    this.setAction(data);
    this.setField(data);
    this.setOperator(data);
    this.renderMultiSearch((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  /** @template method */
  templateSingle(data) {
    this.setAction(data);
    this.setAttribute(data);
    this.renderSearch((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  setAction(data) {
    this.action = data;
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

  renderMultiSearch(callback) {
    if (typeof this.action === 'undefined') {
      callback(TypeError('setAction(args) is undefined'), null);
    }
    if (typeof this.field === 'undefined') {
      callback(TypeError('setField(args) is undefined'), null);
    }
    if (typeof this.operator === 'undefined') {
      callback(TypeError('setOperator(args) is undefined'), null);
    }
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
      for (var i = 0; i < this.field.length; i++) {
        this.hook.placeholder[i] = this.field[i];
      }
    }
    callback(null, `
      <style>
        .multiSearch input[type=text] {
          width: 130px;
          box-sizing: border-box;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          background-color: white;
          padding: 12px 20px 12px 20px;
          transition: width 0.4s ease-in-out;
        }
        .multiSearch input[type=text]:focus {
          width: 100%;
        }
        .multiSearch input[type=submit] {
          background-color: #7f8c8d;
          border: none;
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          margin: 4px 2px;
          cursor: pointer;
        }
        .multiSearch input[type=submit]:hover {
          background-color: #95a5a6;
        }
      </style>
      <form class='multiSearch' action='${this.action}' method='get'>
        ${Object.keys(this.field).map((index) => {
          return `
            <div><input name='${this.field[index]}' type='text' ` +
                `placeholder='${this.hook.placeholder[index]}'/></div>
          `
        }).join('')}
        <input name='_operator' type='text' value='${operator}' hidden/>
        <div><input type='submit'${submit} /></div>
      </form>
    `);
  }

  renderSearch(callback) {
    if (typeof this.action === 'undefined') {
      callback(TypeError('setAction(args) is undefined'), null);
    }
    if (typeof this.attribute === 'undefined') {
      callback(TypeError('setAttribute(args) is undefined'), null);
    }
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
    callback(null, `
      <style>
        .singleSearch input[type=text] {
          width: 130px;
          box-sizing: border-box;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          background-color: white;
          padding: 12px 20px 12px 20px;
          transition: width 0.4s ease-in-out;
        }
        .singleSearch input[type=text]:focus {
          width: 100%;
        }
        .singleSearch input[type=submit] {
          background-color: #7f8c8d;
          border: none;
          color: white;
          padding: 16px 32px;
          text-decoration: none;
          margin: 4px 2px;
          cursor: pointer;
        }
        .singleSearch input[type=submit]:hover {
          background-color: #95a5a6;
        }
      </style>
      <form class='singleSearch' action='${this.action}' method='get'>
        <div><input name='q' type='text'${placeholder} /></div>
        <div><input name='_attribute' type='text' ` +
            `value='${this.attribute}' hidden autocomplete="off" /></div>
        <div><input type='submit'${submit} /></div>
      </form>
    `);
  }
}

/** @abstract */
class SearchHook {
  /** @abstract */
  setSubmit() {}
  /** @abstract */
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