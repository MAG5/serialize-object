import merge from "lodash.merge"

var patterns = {
  validate: /^[a-z_][a-z0-9_]*(?:\[(?:\d*|[a-z0-9_]+)\])*$/i,
  key: /[a-z0-9_]+|(?=\[\])/gi,
  push: /^$/,
  fixed: /^\d+$/,
  named: /^[a-z0-9_]+$/i,
}

function FormSerializer() {
  // private variables
  var data = {},
    pushes = {}

  // private API
  function build(base, key, value) {
    base[key] = value
    return base
  }

  function makeObject(root, value) {
    var keys = root.match(patterns.key),
      k

    // nest, nest, ..., nest
    while ((k = keys.pop()) !== undefined) {
      // foo[]
      if (patterns.push.test(k)) {
        var idx = incrementPush(root.replace(/\[\]$/, ""))
        value = build([], idx, value)
      }

      // foo[n]
      else if (patterns.fixed.test(k)) {
        value = build([], k, value)
      }

      // foo; foo[bar]
      else if (patterns.named.test(k)) {
        value = build({}, k, value)
      }
    }

    return value
  }

  function incrementPush(key) {
    if (pushes[key] === undefined) {
      pushes[key] = 0
    }
    return pushes[key]++
  }

  function encode(pair) {
    return pair.value
  }

  function addPair(pair) {
    if (!patterns.validate.test(pair.name)) return this
    var obj = makeObject(pair.name, encode(pair))
    data = merge(data, obj)
    return this
  }

  function addPairs(pairs) {
    if (!Array.isArray(pairs)) {
      throw new Error("formSerializer.addPairs expects an Array")
    }
    for (var i = 0, len = pairs.length; i < len; i++) {
      this.addPair(pairs[i])
    }
    return this
  }

  function serialize() {
    return data
  }

  // public API
  this.addPair = addPair
  this.addPairs = addPairs
  this.serialize = serialize
}

FormSerializer.patterns = patterns

export { FormSerializer }
export default function serializeObject(pairs) {
  return new FormSerializer().addPairs(pairs).serialize()
}
