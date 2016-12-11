mongoose-model-loader
===

Installation
---
```bash
npm install davidbayo10/mongoose-model-loader --save
```

Getting started
===
```javascript
'use strict'

const mongooseModelLoader = require('mongoose-model-loader');

/**
* @param dirname {String} Full project main path
* @return {Promise}
*/

function init(dirname) {
  const sourcePath = dirname + '{ models directory }';
  return mongooseModelLoader.loader({
    db: 'localhost/name-of-database'
    sourcePath: sourcePath,
    fileExtension: '.model.js',     // .js as default
  });
}
```

Model file example
---
```javascript
// user.model.js

'use strict'

const model = {
  name: {
    type: String,
    required: true,
  },
  surname: String,
  nif: {
    ref: 'Nifs',
  },
  age: Number,
  logs: [
    {
      date: Date,
      ip: String,
    },
  ],
  status: {
    type: String,
    default: 'ON',
  }
}

module.exports = model;
```

Models are mongoose schema definitions.

For more info: [Go to Mongoose Docs](http://mongoosejs.com/docs/guide.html)

LICENSE
===

`mongoose-model-loader` is available under the following licenses:

  * ISC

Copyright 2016 - David Bayo Alcaide
