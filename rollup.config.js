import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import butternut from 'rollup-plugin-butternut';
import postcss from 'rollup-plugin-postcss';
import stylus from 'stylus';
import autoprefixer from 'autoprefixer';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import commonjs from 'rollup-plugin-commonjs';
import cssnano from 'cssnano';
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';

const preprocessor = (content, id) =>
  new Promise((fullfill, reject) => {
    const renderer = stylus(content, {
      filename: id,
      sourcemap: { inline: true }
    });
    renderer.render((err, code) => {
      if (err) {
        return reject(err);
      }
      return fullfill({ code, map: renderer.sourcemap });
    });
  });

const postcssPlugins = [
  autoprefixer
];

if (isProd) {
  postcssPlugins.push(cssnano()); // @FIXME: run cssnano only on the bundle.min.css
}

const plugins = [
  resolve(),
  babel({
    exclude: ['node_modules/**', 'src/styles/main.styl'],
    plugins: ['external-helpers']
  }),
  postcss({
    preprocessor,
    extensions: ['.styl'],
    extract: true,
    plugins: postcssPlugins
  }),
  commonjs({
    include: 'node_modules/**'
  }),
  !isProd && livereload({
    watch: ['examples', 'build']
  }),
  !isProd && serve({
    port: 3000,
    contentBase: ['examples', 'build']
  })
];

const browserBundle = {
  input: 'src/index.js',
  output: [{
    file: pkg.mainmin,
    format: 'umd',
    name: 'OECDCharts',
    sourcemap: true
  }],
  plugins: [
    ...plugins,
    butternut()
  ]
};

const moduleBundle = {
  input: 'src/index.js',
  output: [{
    file: pkg.main,
    format: 'umd',
    name: 'OECDCharts',
    sourcemap: true
  }, {
    file: pkg.module,
    format: 'es',
    sourcemap: true
  }],
  external: isProd ? Object.keys(pkg.dependencies) : [],
  plugins
};

export default isProd ? [browserBundle, moduleBundle] : moduleBundle;
