/** @abstract */
class Callback {
  constructor() {
    this.onSuccessErrorMessage = 'Abstraction error: onSuccessGet() harus ' +
    'diimplementasikan pada child class';
    this.onErrorErrorMessage = 'Abstraction error: onErrorGet() harus ' +
    'diimplementasikan pada child class';

    if (this.constructor === Callback) {
      throw new TypeError('Abstraction error: abstract class tidak bisa ' +
        'dinstansiasikan langsung.'); 
    }

    /** @abstract */
    if (this.onSuccessGet === undefined) {
      throw new TypeError(this.onSuccessErrorMessage);
    }
    
    /** @abstract */
    if (this.onErrorGet === undefined) {
      throw new TypeError(this.onErrorErrorMessage);
    }
  }

  onSuccessPost() {}
  onErrorPost() {}
  onSuccessPut() {}
  onErrorPut() {}
  onSuccessDelete() {}
  onErrorDelete() {}
}

module.exports = Callback;