let relibrary = require('relibrary');

class RequestData extends relibrary.Callback {
  requestDataService = new relibrary.RequestDataService();

  constructor() {
    super();
  }

  onSuccess(data) {
    return data;
  }

  onError(error) {
    return error;
  }

  request() {
    // let target = {
    //   from: ''
    // }
    // return this.requestDataService.getData(target);
  }
}

module.exports = RequestData;