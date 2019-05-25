Dev notes

Develop on a local server using watchify to recompile on changes.
Details at https://www.codementor.io/romanliutikov/es2015-project-setup-browserify-babel-hot-reloading-du107tqk3

Replace stage-0 with @babel/preset-env

> npm i-D npm-run-all

    "watchify": "watchify js/air-perf.js -o dist/air-perf.js -dv",
    "serve": "serve public",
    "start": "npm-run-all --parallel watchify serve"

Then, run test:watch script from IDE console.

> npm run test:watch

