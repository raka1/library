class DocServeController {
  listView(data) {
    return new Promise((resolve, reject) => {
      if (data.length === 0) {
        reject('Doc serve error: data yang dicari kosong.')
      }
    })
  }

  tileView(data) {
    return new Promise((resolve, reject) => {
      if (data.length === 0) {
        reject('Doc serve error: data yang dicari kosong.')
      }
    })
  }
}

module.exports = DocServeController;