class DocServeController {
  #RequestDataService = require('./RequestDataService');
  #requestDataService = new this.#RequestDataService();

  template(data, head) {
    let template = `
      <style>
        .listView {
          margin-bottom: 10px;
        }
        .listView div a {
          color: #2980b9;
          text-decoration: none;
        }
        .listView div a:hover {
          text-decoration: underline;
        }
        .listView div:nth-of-type(1) {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .listView div:nth-of-type(2) {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      </style>
      ${Object.keys(data).map((index) => {
        return `
          <div class='listView'>
            <div>
              <a href="/${head.dirLink}/${data[index][head.id]}">
                ${data[index][head.title]}
              </a>
            </div>
            <div>${data[index][head.abstract]}</div>
            <div>${data[index][head.year]}</div>
          </div>
        `;
      }).join('')}
    `;
    if (head.hasOwnProperty('docServe')) {
      let queryParams = `${head.thisUrl.pathname}?`;
      let i = 0;
      let page = Number(head.length[0]['COUNT(*)']/head.max);
      template = `${template}<div style='word-wrap: break-word;'>`;
      for (let [property, value] of Object.entries(head.thisUrl.query)) {
        i++;
        if (property === 'page') {
          continue;
        }
        queryParams = `${queryParams}${property}=${head.thisUrl.query[property]}`;
        if (i === Object.keys(head.thisUrl.query).length) {
          break;
        } else {
          queryParams = `${queryParams}&`
        }
      }
      for (i = 0; i < page; i++) {
        let pageLink = `${queryParams}&page=${i+1}`
        template = `${template}<a href="${pageLink}">${i+1}</a>`;
      }
      template = `${template}</div>`;
    }

    return template;
  }

  listView(data, head) {
    return new Promise((resolve, reject) => {
      if (data.length === 0) {
        reject('Doc serve error: data yang dicari kosong.');
      }

      if (typeof head === 'object') {
        if (head.hasOwnProperty('title') && head.hasOwnProperty('abstract') &&
            head.hasOwnProperty('year') && head.hasOwnProperty('id') &&
            head.hasOwnProperty('dirLink') && head.hasOwnProperty('max')) {
          if (data.hasOwnProperty('docServe')) {
            data.limit = head.max;
            head.docServe = data.docServe;
            head.limit = head.max;
            head.thisUrl = data.thisUrl;
            if (Object.hasOwnProperty.bind(head.thisUrl.query)('page')) {
              data.offset = Number(head.limit*head.thisUrl.query.page);
            }
            this.#requestDataService.getLength(data)
                .then(length => {
                  head.length = length;
                  this.#requestDataService.getData(data)
                      .then(result => resolve(this.template(result, head)))
                      .catch(error => reject(error));
                })
                .catch(error => reject(error));
          } else {
            resolve(this.template(data, head));
          }
        } else {
          reject('Doc serve error: dibutuhkan argumen head dengan title, ' +
              'abstract, year, id, dirLink, dan max.');
      }
      } else {
        reject('Doc serve error: dibutuhkan argumen head dengan title, ' +
            'abstract, year, id, dirLink, dan max.');
      }
    })
  }

  tileView(data, head) {
    return new Promise((resolve, reject) => {

    });
  }
}

module.exports = DocServeController;