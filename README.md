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
