//-----------------------------------------------------
// SWANIX UI
// by Sebastian Serna
// 2015 - 2018
//-----------------------------------------------------

'use strict';

var gulp = require('gulp' ),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    postcss = require('gulp-postcss'),
    postcssPrefixer = require('postcss-prefixer'),
    header = require('gulp-header'),
    stripCssComments = require('gulp-strip-css-comments'),
    removeEmptyLines = require('gulp-remove-empty-lines'),
    data = require('gulp-data'),
    nunjucks = require('gulp-nunjucks');


//-----------------------------------------------------
// Global variables
//-----------------------------------------------------


// Sass to CSS
var inputSass = 'src/**/*.scss';
var outputSass = 'dist/';
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};
var outputDocs = 'docs/styles/';

// Nunjucks to HTML
var inputHtml = 'docs/templates/*.njk';
var inputAllHtml = 'docs/templates/**/*.njk';
var outputHtml = 'docs/';

//-----------------------------------------------------
// Sass compiler task
//-----------------------------------------------------

gulp.task ('sass', ['inject-version'] , function() {
    return gulp
      .src(inputSass)
      .pipe(plumber())
      .pipe(sass(sassOptions).on('error', sass.logError))
      .pipe(gulp.dest(outputSass))
      .pipe(gulp.dest(outputDocs))
      .pipe(cleanCSS())
      .pipe(rename('swanix.min.css'))
      .pipe(gulp.dest(outputSass))
      .pipe(gulp.dest(outputDocs))
      .pipe(browserSync.stream());
});

//-----------------------------------------------------
// PostCSS compiler task (CSS namespace)
//-----------------------------------------------------

gulp.task('css-ns', function () {
  var plugins = [
      postcssPrefixer({ 
          prefix: 'sw-',
          ignore: ([ /is-/, '.small', '.medium', '.large' ])      
        })
       ];
  return gulp.src('./dist/*.css')
      .pipe(postcss(plugins))
      .pipe(gulp.dest('./dist/ns/'));
});

//-----------------------------------------------------
// HTML compiler task
//-----------------------------------------------------

gulp.task('html', function () {
  gulp
    .src(inputHtml)
    .pipe(data(function() {
      pkg = require('./package.json');
      return pkg;
    }))
    .pipe(nunjucks.compile())
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest(outputHtml));
});

//-----------------------------------------------------
// CSS version header task
//-----------------------------------------------------

// Using data from package.json
var pkg = require('./package.json');
var pkgVersion = ['/*!',
  ' * <%= pkg.name %> - v<%= pkg.version %>',
  ' * <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  '  ',
  ''].join('\n');
 
// Inject version header
gulp.task('inject-version', function(){
    gulp.src('./src/swanix.scss')
    .pipe(stripCssComments({preserve: false}))
    .pipe(removeEmptyLines())
    .pipe(header(pkgVersion, { pkg : pkg } ))
    .pipe(gulp.dest('./src/'));
});

//-----------------------------------------------------
// BrowserSync task (server)
//-----------------------------------------------------

gulp.task ('browser-sync' , function() {
    browserSync.init({
        server: {
          baseDir: './',
          index: './docs/index.html',
          serveStaticOptions: {
            extensions: ['html']
          }
        }
    });
    gulp.watch([
      'docs/**/*.html',
      'dist/*.css',
      './package.json'
      ]).on("change", browserSync.reload);
});

//-----------------------------------------------------
// Watch tasks
//-----------------------------------------------------

gulp.task('watch', ['html', 'sass', 'css-ns', 'browser-sync'] , function() {
      gulp.watch(inputSass, ['sass', 'css-ns' ]);
      gulp.watch(inputAllHtml, ['html']);
});

//-----------------------------------------------------
// Version task
//-----------------------------------------------------

gulp.task('update-version', ['html', 'sass', 'css-ns', ]);
