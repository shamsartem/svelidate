import { ref } from './common'
export default (equalTo) => function sameAs (value, outerF, f) {
  if (typeof equalTo === 'function') {
    return [value === equalTo(outerF, f).$val, [equalTo(outerF, f)]]
  } else {
    return [value === f[equalTo], [f[equalTo]]]
  }
}
