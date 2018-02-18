import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import butternut from 'rollup-plugin-butternut';
import postcss from 'rollup-plugin-postcss';
import stylus from 'stylus';
import autoprefixer from 'autoprefixer';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import multidest from 'rollup-plugin-multi-dest';
import cssnano from 'cssnano';

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

export default {
  entry: 'src/index.js',
  moduleName: 'OECDCharts',
  format: 'umd',
  dest: 'build/bundle.js',
  sourceMap: true,
  plugins: [
    resolve(),
    replace({
      ENVIRONMENT: JSON.stringify(process.env.NODE_ENV)
    }),
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
    multidest([
      {
        dest: 'build/bundle.min.js',
        sourceMap: true,
        plugins: [
          butternut()
        ]
      }
    ]),
    !isProd && livereload({
      watch: ['examples', 'build']
    }),
    !isProd && serve({
      port: 3000,
      contentBase: ['examples', 'build']
    })
  ]
};
