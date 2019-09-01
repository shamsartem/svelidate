import { req, ref } from './common'
export default (prop) => (value, f) =>
  !ref(prop, f) ? req(value) : true
