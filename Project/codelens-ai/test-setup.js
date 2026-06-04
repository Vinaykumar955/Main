const path = require('path');
const Module = require('module');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'vscode') {
    return path.join(__dirname, 'src', '__tests__', '__mocks__', 'vscode.js');
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
