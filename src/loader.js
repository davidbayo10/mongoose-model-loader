'use strict';
const fs = require('fs');
const path = require('path');
const util = require('util');
const mongoose = require('mongoose');
const walk = require('walk');
const toSchema = require('./schema').toSchema;

// TODO: Walker.js external file
// TODO: Util.js file

String.prototype.capitaliseFirstLetter = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function throwError(message) {
  throw new Error('[Error]:[Mongoose-Model-Loader]: ' + message);
}

function validateOptions(options) {
  const db = options.db;
  const sourcePath = options.sourcePath;
  const fileExtension = options.fileExtension;
  const excludedFiles = options.excludedFiles;

  if (!db) {
    throwError('Url database is required');
  }

  if (!sourcePath) {
    throwError('Source path is required');
  }

  if (fileExtension && !util.isString(fileExtension)) {
    throwError('File extension must be a string');
  }

  if (excludedFiles && !util.isArray(excludedFiles)) {
    throwError('Excluded files must be an array');
  }
}

function isValidFileExtension(fileName, fileExtension) {
  const validFileExtension = fileName.match(new RegExp(fileExtension));
  if (!validFileExtension) {
    return false;
  }

  return true;
}

function notExcludedFile(fileName, excludedFiles) {
  if (!excludedFiles.length) {
    return true;
  }

  return excludedFiles.find(excludedFile => excludedFile !== fileName);
}

function getName(fileName, fileExtension) {
  const match = fileName.match(new RegExp(fileExtension));
  if (!match) {
    return;
  }

  return fileName.substr(0, match.index);
}

function checkFile(fileExtension, excludedFiles) {
  return (root, fileStat, next) => {
    const fileName = fileStat.name;
    fs.readFile(path.resolve(root, fileName), () => {
      const shouldRequireModel =
        isValidFileExtension(fileName, fileExtension) &&
        notExcludedFile(fileName, excludedFiles);

      if (shouldRequireModel) {
        const modelName = getName(fileName, fileExtension).capitaliseFirstLetter();
        const model = require(`${root}/${fileName}`);
        const schema = toSchema(model);
        mongoose.model(modelName, schema);
      }

      next();
    });
  };
}

function loader(options, cb) {
  options = options || {};
  return new Promise((resolve, reject) => {
    try {
      validateOptions(options);
      mongoose.connect(options.db);
      const fileExtension = options.fileExtension || '.js';
      const excludedFiles = options.excludedFiles || [];
      const walker = walk.walk(options.sourcePath, { followLinks: false });
      walker.on('file', checkFile(fileExtension, excludedFiles));
      walker.on('error', err => {
        cb(err);
        reject();
      });
      walker.on('end', () => {
        cb(null);
        resolve();
      });
    } catch (err) {
      cb(err);
      reject(err);
    }
  });
}

function loaderSync(options) {
  options = options || {};
  validateOptions(options);
  mongoose.connect(options.db);
  const fileExtension = options.fileExtension || '.js';
  const excludedFiles = options.excludedFiles || [];
  const walkerOptions = {
    followLinks: false,
    listeners: {
      file: checkFile(fileExtension, excludedFiles),
    },
  };
  walk.walkSync(options.sourcePath, walkerOptions);
}

exports.loader = loader;
exports.loaderSync = loaderSync;
