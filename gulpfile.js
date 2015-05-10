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
var webshot = require('webshot');

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


function testDemo() {
    return gulp.src('demo.html')
        .pipe(mochaPhantomJS());
}

function setupTestMisc(testNumber) {
    return function() {
        process.env.TEST_NUMBER = testNumber;
        return gulp.src('misc.html')
            .pipe(mochaPhantomJS());
    };
}

//tasks
gulp.task('default', function() {
    gulp.watch('src/*.css', ['copy-css']);
    gulp.watch('src/*.js', ['build']);
    gulp.watch('demo.html', ['build']);
});

gulp.task('release', ['build'], function() {
    gulp.start('test');
});

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
    var css = fs.readFileSync('src/colorizer.css');
    var md = ['#Colorizer built-in palettes'];
    Object.keys(palettes).forEach(function(paletteName) {
        var paletteObj = palettes[paletteName];
        var fileName = 'images/palette-' + paletteName + '.png';

        md.push('\n\n##' + paletteName);
        Object.keys(paletteObj.colors).sort().forEach(function(color) {
            md.push('\n* ' + color + ' = ' + paletteObj.colors[color]);
        });
        md.push('\n![foreground/background color combinations in the ' + paletteName + ' palette](' + fileName + '?raw=true)');

        var paletteHtml = generatePaletteHtml(paletteObj);

        var html = ['<html><head>'];
        html.push('<style>body{ background: white; font-family: sans-serif; font-size: 2em; height: 300px; }' + css + '</style>');
        html.push('</head><body>');
        html.push(paletteHtml);
        html.join('</body></html>');

        //lazy stuff here
        var rows = Math.ceil( (paletteHtml.split('colorizer-palette-pair').length - 1) / 8);
        var height = rows * 58 + 14; //yeah, magic numbers, whatever

        webshot(
            html.join(''), 
            fileName, 
            { 
                siteType:'html', 
                windowSize: { width: 480, height: height }, 
                shotSize: { width: 480, height: height }, 
                quality: 100
            }, 
            function(err) { if(err) { console.log('Error'); } }
        );
    });
    fs.writeFile('palettes.md', md.join(''));
});


var tests = ['testDemo'];

gulp.task('testDemo', testDemo);

for(var testNumber = 0; testNumber < 3; testNumber++) {
    var testName = 'testMisc_' + testNumber;
    gulp.task(testName, [ tests[tests.length - 1] ], setupTestMisc(testNumber));
    tests.push(testName);
}

gulp.task('test', [tests[tests.length - 1]]);
