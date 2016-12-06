'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function convert(model) {
  const schema = {};
  for (const key in model) {
    let value = model[key];
    const isArray = Array.isArray(value);
    if (value.virtual) {
      continue;
    }

    if (isArray) {
      value = value[0];
    }

    if (!(value.type || value.ref || value.required)) {
      value = convert(value);
    }

    if (value.ref) {
      value.type = mongoose.Schema.ObjectId;
      if (typeof value.ref !== 'string') {
        delete value.ref;
      }
    }

    if (value.type === 'Mixed') {
      value.type = Schema.Types.Mixed;
    }

    schema[key] = isArray ? [value] : value;
  }

  return schema;
};

exports.toSchema = function toSchema(model, options) {
  const schema = convert(model);
  return new Schema(schema, options);
};
