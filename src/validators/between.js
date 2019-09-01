import { req } from './common'

export default (min, max) => (value) =>
  !req(value) ||
  ((!/\s/.test(value) || value instanceof Date) &&
    +min <= +value &&
    +max >= +value)
