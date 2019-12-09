let relibrary = require('relibrary');

class DocServe extends relibrary.Callback {
  #docServeController = new relibrary.DocServeController();

  constructor() {
    super();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }

  docServe(data) {
    // let head = {
    //   title: '',
    //   abstract: '',
    //   year: '',
    //   id: '',
    //   dirLink: '',
    //   max: ''
    // }
    // return this.#docServeController.listView(data, head);
    // return this.#docServeController.tileView(data, head);
  }
}

module.exports = DocServe;