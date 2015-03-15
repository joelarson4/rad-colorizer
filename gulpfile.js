'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var mocha = require('gulp-mocha');
var shell = require('gulp-shell');
var jshint = require('gulp-jshint');
var del = require('del');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var palettes = require('./src/palettes');
var generatePaletteHtml = require('./src/generatePaletteHtml');
var fs = require('fs');

var builddir = 'build/';

//utils
var browserifyIt = function(bopts, ropts, ignore) {
    return transform(function(filename) {
        var br = browserify(filename, bopts)
            .external('rad-reveal')
            .require(filename, ropts);
        if(ignore) {
            br.ignore(ignore);
        }
        return br.bundle();
    });
};



function test() {
    return gulp.src('demo.html')
        .pipe(mochaPhantomJS());
}

//tasks
gulp.task('default', function() {
  gulp.watch('src/*.css', ['copy-css']);
  gulp.watch('src/*.js', ['build']);
  gulp.watch('demo.html', ['build']);
});

gulp.task('release', ['build'], test);

gulp.task('build', ['copy-css', 'gen-palette-doco'], function() {
    return gulp.src('src/colorizer.js')
        .pipe(browserifyIt({ ignoreMissing: true }))
        .pipe(gulp.dest(builddir))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(builddir));
});

gulp.task('copy-css', function() {
    return gulp.src('src/colorizer.css')
        .pipe(gulp.dest(builddir));
});

gulp.task('gen-palette-doco', function() {
    var out = ['#Colorizer built-in palettes'];
    var css = fs.readFileSync('src/colorizer.css');
    Object.keys(palettes).forEach(function(paletteName) {
        out.push('##' + paletteName);
        out.push('\n');
        out.push(generatePaletteHtml(palettes[paletteName]));
        out.push('\n<br><br><br><br>\n\n');
    });
    out.push('<style>' + css + '</style>');
    fs.writeFile('palettes.md', out.join(''));
});


gulp.task('test', test);
