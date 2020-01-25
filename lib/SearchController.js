class SearchController {
  multiSearch(request) {
    return new Promise((resolve, reject) => {
      if(request !== null) {
        if (!Array.isArray(request) && typeof request === 'object') {
          if (request.hasOwnProperty('method') &&
              request.hasOwnProperty('action') &&
              request.hasOwnProperty('field') &&
              request.hasOwnProperty('operator')) {
            resolve(`
              <form action="${request.action}" method="${request.method}">
                ${Object.keys(request).map((index) => {
                  return `
                    <input type="text" />
                  `
                }).join('')}
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
            if (request.hasOwnProperty('cssId')) {
              id = ` id = '${request.cssId}'`
            } else {
              id = '';
            }
            resolve(`
              <form action='${request.action}' method='${request.method}'${id}>
                <input type='text' />
                <input name='_attribute' type='text' value='${request.attribute}' hidden />
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