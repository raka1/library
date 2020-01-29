class Filter {
  hook = new FilterHooking();
  
  filterCheck(data) {

  }

  filterRange(data) {

  }
}

/** @abstract */
class FilterHook {
  /** @abstract */
  hook() {}
}

class FilterHooking extends FilterHook {
  hook() {}
}

module.exports = Filter;