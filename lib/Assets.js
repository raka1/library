class Assets {
  #fs = require('fs');
  #url = require('url');

  constructor(dir, request, response) {
    let thisUrl = this.#url.parse(request.url, true);
    let thisUrlSegments = thisUrl.pathname.split('/');
    if (thisUrlSegments[0] === '' && thisUrlSegments[1] === '_assets') {
      dir = dir.split('/');
      if (dir[dir.length - 1] !== '') {
        dir.push('');
      }
      if (dir[0] === '') dir[0] = '.';
      else if (dir[0] !== '' && dir[0] !== '.')
        dir.unshift('.');
      let flag = 0;
      for (var i = 0; i < dir.length; i++) {
        if (dir[i] === '' && flag === 0) flag = 1;
        else if (dir[i] === '' && flag === 1) {
          dir.splice(i, 1);
          i -= 1;
        }
        else if (dir[i] !== '' && flag === 1) flag = 0;
      }
      dir = dir.join('/');
      thisUrlSegments.shift();
      thisUrlSegments.shift();
      let file = thisUrlSegments.join('/');
      response.end(this.#fs.readFileSync(dir + file, 'utf8'));
    }
  }
}

module.exports = Assets;