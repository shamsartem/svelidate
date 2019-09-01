// "required" core, used in almost every validator to allow empty values
export const req = (value) => {
  if (Array.isArray(value)) return !!value.length
  if (value === undefined || value === null) {
    return false
  }

  if (value === false) {
    return true
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return !isNaN(value.getTime())
  }

  if (typeof value === 'object') {
    for (let _ in value) return true
    return false
  }

  return !!String(value).length
}

// get length in type-agnostic way
export const len = (value) => {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'object') {
    return Object.keys(value).length
  }
  return String(value).length
}

export const ref = (reference, f) =>
  typeof reference === 'function'
    ? reference.call(f)
    : f[reference]

// regex based validator template
export const regex = (name, expr) => {
  const f = (req, expr) => function $$$ (value) { return !req(value) || expr.test(value) }
  const namedF = new Function( // eslint-disable-line no-new-func
    `return ${f.toString().replace('$$$', name)}`
  )()

  return namedF(req, expr)
}
