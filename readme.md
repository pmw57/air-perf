Dev notes

Develop on a local server using watchify to recompile on changes.
Details at https://www.codementor.io/romanliutikov/es2015-project-setup-browserify-babel-hot-reloading-du107tqk3

Replace stage-0 with @babel/preset-env

> npm i-D npm-run-all

    "test:watch": "mocha --require @babel/polyfill --require @babel/register --watch",
    "watchify": "watchify src/air-perf.js -o dist/air-perf.js -dv --standalone airperf",
    "test": "npm-run-all --parallel watchify test:watch"

Then, run test from IDE console.

> npm run test

