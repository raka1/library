class Filter {
  hook = new FilterHooking();

  /** @template method */
  template(data) {
    this.setField(data);
    this.render((error, data) => {
      if (error) console.log(error);
      return data;
    });
  }

  setField(data) {
    this.field = data;
    return this;
  }

  setRequest(data) {
    this.request = data;
    return this;
  }
  
  render() {
    return new Promise((resolve, reject) => {

    });
  }

  filterCheck(data) {

  }

  filterRange(data) {

  }
}

/** @abstract */
class FilterHook {
  /** @abstract */
  setPlaceholder() {}
}

class FilterHooking extends FilterHook {
  setPlaceholder(data) {
    this.placeholder = data;
    return this;
  }
}

module.exports = Filter;