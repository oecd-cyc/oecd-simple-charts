# OECD Simple Charts

A lightweight chartingtool. Visit the [docs](https://oecd-cyc.github.io/oecd-simple-charts) or checkout the [code](https://github.com/oecd-cyc/oecd-simple-charts).

<img src="https://raw.githubusercontent.com/oecd-cyc/oecd-simple-charts/master/public/images/charts-example.png" style="width:100%; max-width: 960px">

## Usage

To get started, you can either install the library using npm

```
npm install oecd-simple-charts
```

or embed the `bundle.min.js` and `bundle.min.css` files, either downloading them from the [repository](https://github.com/oecd-cyc/oecd-simple-charts) or directly embedding them from a CDN service like [unpkg](https://unpkg.com/oecd-simple-charts/build/bundle.min.js) or [jsDelivr](https://cdn.jsdelivr.net/npm/oecd-simple-charts).

```html
<script src="https://unpkg.com/oecd-simple-charts/build/bundle.min.js"></script>
<link href="https://unpkg.com/oecd-simple-charts/build/bundle.min.css" rel="stylesheet">
```

In order to create a chart you need to add a container DOM node. Then you can start with the configuration of the chart. You can set a title, change the size and color of the elements and add data points. Each chart has an `update` function, that takes an array of new data and updates the visualization.

## Development

Clone the repository, install the dependencies, builds the application and starts a webserver with hot loading on [localhost:3000](http://localhost:3000/):

```sh
$ git clone https://github.com/oecd-cyc/oecd-simple-charts.git
$ cd oecd-simple-charts
$ npm install
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
