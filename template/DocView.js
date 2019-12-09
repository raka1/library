let relibrary = require('relibrary');

class DocView extends relibrary.Callback {
  #docLoader = new relibrary.DocLoader();

  constructor() {
    super();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }

  loadDoc(data) {
    // let target = {
    //   id: {
    //     kolom_id: data
    //   },
    //   filename: 'kolom_nama_file',
    //   from: ''
    // }
    // return this.#docLoader.getDoc(target)
  }
}

module.exports = DocView;