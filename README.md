# OECD Simple Charts

A lightweight chartingtool. Visit the [docs](https://oecd-cyc.github.io/oecd-simple-charts) or checkout the [code](https://github.com/oecd-cyc/oecd-simple-charts).

<img src="https://raw.githubusercontent.com/oecd-cyc/oecd-simple-charts/master/public/images/charts-example.png" style="max-width: 960px">

## Installation

```sh
$ git clone https://github.com/oecd-cyc/oecd-simple-charts.git && cd oecd-simple-charts
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

## Update documentation

In order to generate the docs, run:

```sh
$ npm run docs
```
