import { req } from './common'
export default function required (value) {
  if (typeof value === 'string') {
    return req(value.trim())
  }
  return req(value)
}
