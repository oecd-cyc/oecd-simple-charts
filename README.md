# OECD Generic charting tool

A lightweight chartingtool. Find the docs [here](https://oecd-cyc.github.io/generic-charting-tool).

<img src="https://raw.githubusercontent.com/oecd-cyc/generic-charting-tool/master/public/images/charts-example.png" style="max-width: 960px">
## Installation

```sh
$ git clone https://github.com/oecd-cyc/generic-charting-tool.git && cd generic-charting-tool
```

```sh
$ npm install
```

## Development

Builds the application and starts a webserver with hot loading.
Runs on [localhost:3000](http://localhost:3000/):

```sh
$ npm start
```

## Build

Builds a minified version of the library in the `build/` folder.

```sh
$ npm run build
```

## Testing

Run the functional test-suite located in `test/`:

```sh
$ npm test
```

To run the visual-regression tests, you will first need a running webserver on port 3000 (see [Development](#development)). Then you can start the tests running:

```sh
$ npm run test:visual
```

If the test fails, but you want to keep your changes run:

```sh
$ npm run test:visual:reference
```

This will save new screenshots in the `screenshots/` folder and these will be used as reference to be tested against the next time you run the tests.

## Documentation

Make sure to use node version 8.4. The complete documentation can be found in `docs/`. Start docs server:

```sh
npm run docs-server
```

Open `localhost:3333` in your browser.

In order to generate the docs(node 6.x is required), run:

```sh
$ npm run docs
```
