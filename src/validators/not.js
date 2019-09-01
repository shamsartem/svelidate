import { req } from './common'
export default (validator) => (value, f) =>
  !req(value) || !validator.call(value, f)
