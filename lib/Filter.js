class Filter {
  hook = new FilterHooking();

  template(data) {
    this.setField(data);
    this.render()
        .then(data => data)
        .catch(err => console.log(err));
  }

  setField(data) {
    this.field = data;
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
  setSubmit() {}
  /** @abstract */
  setPlaceholder() {}
}

class FilterHooking extends FilterHook {
  setSubmit(data) {
    this.submit = data;
    return this;
  }

  setPlaceholder(data) {
    this.placeholder = data;
    return this;
  }
}

module.exports = Filter;