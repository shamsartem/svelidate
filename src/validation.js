import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'

function isFunction (val) {
  return typeof val === 'function'
}

function isObject (val) {
  return val !== null && (typeof val === 'object' || isFunction(val))
}

function isPromise (object) {
  return isObject(object) && isFunction(object.then)
}

const defaultErrorMessages = {
  required: () => 'This is required',
  alpha: () => 'This should contain only latin letters',
  sameAs: (current, f, related) => `This should be the same as ${related[0].label} field`,
}

export function validator (errorMessages = {}) {
  errorMessages = {
    ...defaultErrorMessages,
    ...errorMessages,
  }
  let initPrevF = {}
  let outerF

  return function validateOnlyChanged (f, update, prevF = initPrevF, outer = true) {
    if (outer) {
      outerF = f
    }

    Object.keys(f).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(f[key], '$val')) {
        if (!prevF[key] && Array.isArray(f[key])) {
          prevF[key] = []
        } else if (!prevF[key]) {
          prevF[key] = {}
        }

        validateOnlyChanged(f[key], (val) => {
          f[key] = val
          update(f)
        }, prevF[key], false)
      } else if (
        (!prevF[key] &&
          f[key].$validators &&
          f[key].$validators.length) ||
        (f[key].$validators &&
          f[key].$validators.length &&
          f[key].$val !== prevF[key].$val) ||
        (f[key].$related &&
          prevF[key].$related &&
        f[key].$related.some((input, i) => input.$val !== prevF[key].$related[i].$val))) {
        prevF[key] = {}
        prevF[key].$val = f[key].$val
        prevF[key].$related = cloneDeep(f[key].$related)
        f[key].$valid = new Array(f[key].$validators.length).fill(null)
        f[key].$errorMessages = new Array(f[key].$validators.length).fill('')
        update(f)
        let related = []
        f[key].$validators.forEach((validator, i) => {
          let isValid = validator(f[key].$val, outerF, f)
          if (isPromise(isValid)) {
            isValid.then(validity => {
              f[key].$valid[i] = validity
              f[key].$errorMessages[i] = validity ? '' : errorMessages[validator.name](f[key], f)
              update(f)
            })
          } else {
            let currentRelated
            if (Array.isArray(isValid)) {
              currentRelated = isValid[1]
              related.push(...isValid[1])
              isValid = isValid[0]
            }
            f[key].$valid[i] = isValid
            f[key].$errorMessages[i] = isValid ? '' : errorMessages[validator.name](f[key], f, currentRelated)
          }
        })
        f[key].$related = related
        update(f)
      }
    })
  }
}

function allAreValid (arr) {
  if (arr.some(el => el === null)) {
    return null
  } else if (arr.some(el => el === false)) {
    return false
  } else {
    return true
  }
}

export function verify (...args) {
  args = args[0]
  const isOuter = !!args.callback

  if (isOuter) {
    args.domEls = []
  }

  let validity = true

  function setValidity (localValid) {
    if (localValid === null) {
      validity = null
    } else if (localValid === false && validity === true) {
      validity = false
    }
  }

  if (args.execute) {
    for (const key of Object.keys(args.f)) {
      if (!Object.prototype.hasOwnProperty.call(args.f[key], '$val')) {
        let innerArgs = cloneDeep(args)
        delete innerArgs.domEls
        innerArgs = {
          ...args,
          ...innerArgs,
        }
        delete innerArgs.callback
        let innerValidity
        innerArgs.update = (val) => {
          args.f[key] = val
          args.update(args.f)
        }
        innerArgs.setInnerValidity = (validity) => { innerValidity = validity }
        innerArgs.f = innerArgs.f[key]
        verify(innerArgs)
        setValidity(innerValidity)
      } else if (args.f[key].$validators && args.f[key].$validators.length) {
        args.f[key].$dirty = true
        let allValidity = allAreValid(args.f[key].$valid)
        setValidity(allValidity)
        if (!args.notFocusOnFirstEl && args.f[key].$el && !allValidity) {
          args.domEls.push(args.f[key].$el)
        }
      }
    }

    if (args.update) {
      args.update(args.f)
    }

    if (args.setInnerValidity) {
      args.setInnerValidity(validity)
    }

    if (validity !== null) {
      if (validity && isOuter) {
        args.callback()
      } else if (isOuter && args.domEls.length) {
        document.querySelectorAll(args.domEls
          .reduce((selector, el, i, ar) => i ? `${selector}, #${el.id}` : `#${el.id}`, '')
        )[0].focus()
      }
      return false
    }
    return true
  }
  return false
}

export function data (f, outer = true) {
  let startingObj = {}
  if (outer && Array.isArray(f)) {
    startingObj = []
  }

  return Object.keys(f).reduce((res, key) => {
    if (!Object.prototype.hasOwnProperty.call(f[key], '$val')) {
      startingObj[key] = data(f[key])
    } else {
      startingObj[key] = f[key].$val
    }

    return startingObj
  }, startingObj)
}
