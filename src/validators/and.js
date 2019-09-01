export default (...validators) => (...args) =>
  validators.length > 0 &&
  validators.reduce((valid, fn) => valid && fn.apply(this, args), true)
