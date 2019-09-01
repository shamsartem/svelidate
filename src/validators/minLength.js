import { req, len } from './common'
export default (length) => (value) =>
  !req(value) || len(value) >= length
