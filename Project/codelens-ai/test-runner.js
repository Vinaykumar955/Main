const path = require('path');
const fs = require('fs');
const Module = require('module');

const vscodeMockPath = path.join(__dirname, 'src', '__tests__', '__mocks__', 'vscode.js');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent) {
  if (request === 'vscode') {
    return vscodeMockPath;
  }
  return originalResolve.apply(this, arguments);
};

const Mocha = require('mocha');

const mocha = new Mocha({
  ui: 'tdd',
  timeout: 30000,
  reporter: 'spec',
  color: true,
});

try {
  require('ts-node').register({
    project: path.join(__dirname, 'tsconfig.json'),
    transpileOnly: true,
  });
  console.log('ts-node registered successfully');
} catch (e) {
  console.log('ts-node not available, trying to run compiled tests...');
}

const testDir = path.join(__dirname, 'src', '__tests__');
const testFiles = fs.readdirSync(testDir).filter(f => (f.endsWith('.ts') || f.endsWith('.js')) && f !== 'vscode.js');

testFiles.forEach(f => {
  mocha.addFile(path.join(testDir, f));
});

if (testFiles.length === 0) {
  console.error('No test files found in', testDir);
  process.exit(1);
}

console.log(`Found ${testFiles.length} test file(s): ${testFiles.join(', ')}`);
console.log('');

mocha.run(failures => {
  process.exit(failures ? 1 : 0);
});
