'use strict';

const schema = require('./schema');
const loader = require('./loader');

exports.loader = loader.loader;
exports.loaderSync = loader.loaderSync;
exports.toSchema = schema.toSchema;
