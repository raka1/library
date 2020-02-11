class Uri {
  #url = require('url');

  constructor(request) {
    this.request = request;
    this.thisUrl = this.#url.parse(request.url, true);
  }

  segment(segment) {
    let thisUrlSegments = this.thisUrl.pathname.split('/');
    thisUrlSegments[0] = this.request.headers.host;
    return thisUrlSegments[segment];
  }
}

module.exports = Uri;