# svelidate
Asynchronous, reactive, super flexible validation library for svelte

> This is work in progress. Please contribute with your thoughts and code!

1. Create your modal (we support nested modals)

```javascript
import { validator, verify, data } from 'svelidate/validation'
import { required, alpha, sameAs } from 'svelidate/validators'

function asyncValidator () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 2000)
  })
}

let f = {
  plain: {
    $val: '', // this is value that you will bind to your custom input component
    $validators: [required, asyncValidator, alpha], // array of validators
    label: 'plain', // you can add any additional fields that your custom input component needs
  },
  obj: {
    nestedA: {
      $val: '',
      $validators: [required],
      label: 'nestedA',
    },
    nestedB: {
      ar: [
        {
          $val: '',
          $validators: [required, sameAs((f) => f.plain)],
          label: 'nestedB0',
        },
      ],
    },
  },
  array: [
    {
      $val: '',
      $validators: [required],
      label: 'item1',
    },
    {
      $val: '',
      label: 'item2',
    },
  ],
}

```

2. Hook it up in js and html

```javascript
const validate = validator({ // object with custom error messages
  // They are indexed by the name of the function so you should name functions that return error messages
  asyncValidator: (currentField, wholeModel, relatedFields) => 'async wrong',
})

$: validate(f, v => { f = v }) // some boilerplate in order for reactive model update

let doSend = false // variable that controls
$: doSend = verify({ // this function is able to verify any part of the modal or the whole modal
  execute: doSend,
  callback: () => { // this is executed only after you hit send button and modal is validated
    console.log(data(f))
    /*
      data(f) returns an object like this:
      {
        plain: "something"
        obj: {
          nestedA: "something",
          nestedB: {
            ar: ["something"]
          },
        },
        array: ["something", ""],
      }
    */
    ,
  },
  update: v => { f = v }, // some boilerplate for reactive updates
  f,
})

function send () {
  doSend = true
}
```

```html
<form class="wrapper _small" novalidate on:submit|preventDefault="{signUp}">
  <SomeCustomInput bind:f="{f.plain}">
  <SomeCustomInput bind:f="{f.obj.nestedA}">
  <SomeCustomInput bind:f="{f.obj.nestedB.ar[0]}">
  {# each f.array as item, i}
    <SomeCustomInput bind:f="{f.array[i]}">
  {/each}
</form>
```

3. It works!

## Reserved field object properties

Each field object can contain as many properties as your custom input need, but it has some reserved properties:

```javascript
{
  $val, // value of the field
  $el, // input HTML element to put focus on in case of the error (you can turn this off but it's required for accessibility)
  $errorMessages, // array of indexed error messages. If there is no error - you will see an empty string
  $related, // array of fields that are related to the validation of the current field
  $valid, // array of indexed values: [true, false, null] - first validator returned true, second one returned false, third is currently pending
  $validators, // array of validator functions. They should only return true or false. You can use a function that returns promise for async validation
  $dirty, // it is set to true if you try to verify the form. You can use it to display your error messages
}
```

## Example of custom input component

```pug
div.container
  label.ellipses(
    for='{id}'
  ) {label}
    +if('required')
      i(aria-hidden='true' title='required') *
      i.visuallyHidden required
  +if('!f.type')
    input(
      id='{id}'
      required='{required}'
      bind:value='{f.$val}'
      on:blur='{onBlur}'
      bind:this='{el}'
      aria-describedby='{localErrorId}'
    )
    p.ellipses.error(id='{errorId}')
      +each('errorMessages as message'): span {message}
    +elseif('f.type === "password"'): input(
      type='password'
      id='{id}'
      required='{required}'
      bind:value='{f.$val}'
      on:blur='{onBlur}'
      bind:this='{el}'
      aria-describedby='{localErrorId}'
    )
    p.ellipses.error(id='{errorId}')
      +each('errorMessages as message'): span {message}
```

```javascript
import randomId from '/utils/random-id.js'
import { onMount } from 'svelte'

export let id = randomId('input')
export let errorId = randomId('error')
export let f = {}

let el

$: errorMessages = f.$errorMessages && f.$errorMessages.length && f.$dirty
  ? f.$errorMessages
    .reduce((messages, message) => {
      if (message) {
        messages.push(message)
      }
      return messages
    }, [])
    .map((message, i) => i ? `, ${message}` : message)
  : []

$: localErrorId = errorMessages.length ? errorId : undefined

$: required = f.$validators ? f.$validators.some(validator => validator.name === 'required') : undefined
$: label = f.label ? f.label : ''

function onBlur () {
  if (!f.$dirty) {
    f.$dirty = true
  }
}

onMount(() => {
  f.$el = el
})
```
