import { req } from './common'
export default (min) => (value) =>
  !req(value) ||
  ((!/\s/.test(value) || value instanceof Date) && +value >= +min)
