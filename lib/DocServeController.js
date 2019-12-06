class DocServeController {
  listView(data, head) {
    return new Promise((resolve, reject) => {
      if (data.length === 0) {
        reject('Doc serve error: data yang dicari kosong.')
      }
      let template = `
        <div>
          <div><a href="${data.link}">${data.title}</a></div>
          <div style="height: 50px; overflow: hidden; text-overflow: ellipsis;">${data.abstract}</div>
          <div>${data.year}</div>
        </div>
      `;
      resolve(template);
    })
  }

  tileView(data, head) {
    return new Promise((resolve, reject) => {
      if (data.length === 0) {
        reject('Doc serve error: data yang dicari kosong.')
      }
      let template = `
        <div>
          <div><a href="${data.link}">${data.title}</a></div>
          <div style="height: 50px; overflow: hidden; text-overflow: ellipsis;">${data.abstract}</div>
          <div>${data.year}</div>
        </div>
      `;
      resolve(template);
    })
  }
}

module.exports = DocServeController;