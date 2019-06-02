//-----------------------------------------------------
// Swanix UI
// by Sebastian Serna
// (c) 2015-present
//-----------------------------------------------------

const { src, dest, watch, series, parallel } = require('gulp');
// General plugins
const browserSync = require('browser-sync');
const rename = require("gulp-rename");
const plumber = require('gulp-plumber');
const nunjucks = require('gulp-nunjucks');
const data = require('gulp-data');
const header = require('gulp-header');
// Project specific
const sass = require('gulp-sass'); 
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const postcss = require("gulp-postcss");
const postcssPrefixer = require('postcss-prefixer');
const stripCssComments = require('gulp-strip-css-comments');
const removeEmptyLines = require('gulp-remove-empty-lines');

//-----------------------------------------------------
// Server tasks
//-----------------------------------------------------

function watch_files() {
  browserSync.init({
    server: {
        baseDir: 'docs',
        index: 'index.html',
        serveStaticOptions: {
          extensions: ['html']
        }
    }
  });
  watch('./docs/**/*.njk', html_compiler);
  watch('./docs/**/*.html').on('change', browserSync.reload);
  watch('./docs/**/*.json').on('change', browserSync.reload);
  watch('./docs/**/*.svg').on('change', browserSync.reload);
  watch('package.json', series(html_compiler, inject_version, sass_compiler, css_ns));
}

//-----------------------------------------------------
// HTML compiler task
//-----------------------------------------------------

// Nunjucks to HTML paths
var inputHtml = 'docs/templates/*.njk';
var inputAllHtml = 'docs/templates/**/*.njk';
var outputHtml = 'docs/';

function html_compiler() {
  return src(inputHtml)
    .pipe(data(function() {
      delete require.cache[require.resolve('./package.json')];
      pkg = require('./package.json');
      return pkg;
    }))
    .pipe(nunjucks.compile())
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(dest(outputHtml));
}

//-----------------------------------------------------
// Sass compiler task
//-----------------------------------------------------

// Sass paths
var inputSass = 'src/**/*.scss';
var outputSass = 'dist/';
var outputDocs = 'docs/styles/';
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

function sass_compiler() {
  return src(inputSass)
    .pipe(plumber())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(dest(outputSass))
    .pipe(dest(outputDocs))
    .pipe(cleanCSS())
    .pipe(rename('swanix.min.css'))
    .pipe(dest(outputSass))
    .pipe(dest(outputDocs));
}

//-----------------------------------------------------
// PostCSS compiler task (CSS namespace)
//-----------------------------------------------------

function css_ns() {
var plugins = [
    postcssPrefixer({ 
        prefix: 'sw-',
        ignore: ([ /is-/, '.small', '.medium', '.large' ])      
      })
     ];
return src('dist/*.css')
    .pipe(postcss(plugins))
    .pipe(dest('dist/ns/'));
}

//-----------------------------------------------------
// CSS version header task
//-----------------------------------------------------

// Using data from package.json
delete require.cache[require.resolve('./package.json')];
var pkg = require('./package.json');
var pkgVersion = ['/*!',
  ' * <%= pkg.name %> - v<%= pkg.version %>',
  ' * <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  '  ',
  ''].join('\n');

// Inject version header
function inject_version() {
    return src('src/swanix.scss')
    .pipe(stripCssComments({preserve: false}))
    .pipe(removeEmptyLines())
    .pipe(header(pkgVersion, { pkg : pkg } ))
    .pipe(dest('src/'));
}

//-----------------------------------------------------
// TASKS
//-----------------------------------------------------

exports.default = watch_files;
exports.watch = watch_files;
exports.html = html_compiler;
exports.sass = series(inject_version, sass_compiler);
exports.namespace = series(sass, css_ns);
exports.build = series(inject_version, sass_compiler, html_compiler);