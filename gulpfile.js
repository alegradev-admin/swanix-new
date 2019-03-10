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
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync');

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

var outputDocs = 'docs/';


//-----------------------------------------------------
// Sass compiler task
//-----------------------------------------------------

gulp.task ('sass' , function() {
    return gulp
      .src(inputSass)
      .pipe(plumber())
      .pipe(sass(sassOptions).on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(gulp.dest(outputSass))
      .pipe(gulp.dest(outputDocs))
      .pipe(cleanCSS())
      .pipe(rename('swanix.min.css'))
      .pipe(gulp.dest(outputSass))
      .pipe(gulp.dest(outputDocs))
      .pipe(browserSync.stream());
});

//-----------------------------------------------------
// BrowserSync task (server)
//-----------------------------------------------------

gulp.task ('browser-sync' , function() {
    browserSync.init({
        server: {
          baseDir: 'docs',
          index: 'index.html',
          serveStaticOptions: {
            extensions: ['html']
          }
        }
    });
    gulp.watch([
      'docs/*.html',
      'dist/*.css'
      ]).on("change", browserSync.reload);
});

//-----------------------------------------------------
// Watch tasks
//-----------------------------------------------------

gulp.task('watch', ['sass', 'browser-sync'] , function() {
      gulp.watch(inputSass, ['sass']);
      gulp.watch(outputDocs, ['browser-sync']);
});
