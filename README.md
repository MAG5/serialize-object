```js
import serializeObject from "serialize-object"
console.log(serializeObject([{ name: "a[c]", value: "b" }]))
// { a: { c: "b" } }
```
