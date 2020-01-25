class SearchController {
  multiSearch(request) {
    return new Promise((resolve, reject) => {
      if(request !== null) {
        if (!Array.isArray(request) && typeof request === 'object') {
          if (request.hasOwnProperty('method') &&
              request.hasOwnProperty('action') &&
              request.hasOwnProperty('field')) {
            let id;
            let submit;
            let operator = '';
            if (request.hasOwnProperty('cssId')) {
              id = ` id = '${request.cssId}'`
            } else {
              id = '';
            }
            if (request.hasOwnProperty('cssSubmit')) {
              submit = ` value = '${request.cssSubmit}'`
            } else {
              submit = '';
            }
            if (request.hasOwnProperty('operator')) {
              for (var i = 0; i < request.field.length-1; i++) {
                if (request.operator[i] === undefined) request.operator[i] = 'or';
                operator = operator + request.operator[i];
                if (i+1 !== request.field.length-1) operator = operator + ',';
              }
            } else {
              for (var i = 0; i < request.field.length-1; i++) {
                operator = operator + 'or';
                if (i+1 !== request.field.length-1) operator = operator + ',';
              }
            }
            if (!request.hasOwnProperty('cssPlaceholder')) {
              request.cssPlaceholder = {}
            }
            resolve(`
              <form action='${request.action}' method='${request.method}'${id}>
                ${Object.keys(request.field).map((index) => {
                  return `
                    <input name='${request.field[index]}' type='text' placeholder='${request.cssPlaceholder[index]}'/>
                  `
                }).join('')}
                <input name='_operator' type='text' value='${operator}' hidden />
                <input type='submit'${submit} />
              </form>
            `);

          } else {
            reject('ERR03');
          }
        } else {
          reject('ERR02');
        }
      } else {
        reject('ERR01');
      }
    });
  }

  search(request) {
    return new Promise((resolve, reject) => {
      if(request !== null) {
        if (!Array.isArray(request) && typeof request === 'object') {
          if (request.hasOwnProperty('method') &&
              request.hasOwnProperty('action') &&
              request.hasOwnProperty('attribute')) {
            let id;
            let placeholder;
            let submit;
            if (request.hasOwnProperty('cssId')) {
              id = ` id = '${request.cssId}'`
            } else {
              id = '';
            }
            if (request.hasOwnProperty('cssPlaceholder')) {
              placeholder = ` placeholder = '${request.cssPlaceholder}'`
            } else {
              placeholder = '';
            }
            if (request.hasOwnProperty('cssSubmit')) {
              submit = ` value = '${request.cssSubmit}'`
            } else {
              submit = '';
            }
            resolve(`
              <form action='${request.action}' method='${request.method}'${id}>
                <input name='q' type='text'${placeholder} />
                <input name='_attribute' type='text' value='${request.attribute}' hidden />
                <input type='submit'${submit} />
              </form>
            `);
          } else {
            reject('ERR03');
          }
        } else {
          reject('ERR02');
        }
      } else {
        reject('ERR01');
      }
    });
  }
}

module.exports = SearchController;