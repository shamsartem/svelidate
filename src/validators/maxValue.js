import { req } from './common'
export default (max) => (value) =>
  !req(value) ||
  ((!/\s/.test(value) || value instanceof Date) && +value <= +max)
