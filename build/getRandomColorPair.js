require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var palettes = {
    standard: {
        colors: { 
            black:  'black',
            white:  'white',
            gray:   'gray',
            brown:  'brown',
            red:    'red', 
            orange: 'orange', 
            yellow: 'yellow', 
            green:  'green', 
            blue:   'blue', 
            purple: 'purple'
        },
        dontPair: { 
            black:    { white: 1, blue: 1, purple: 1 },
            white:    { black: 1, yellow: 1 },
            gray:     { brown: 1, red: 1, orange: 1, green: 1, purple: 1 },
            brown:    { gray: 1, red: 1, green: 1, blue: 1, purple: 1 },
            red:      { gray: 1, brown: 1, orange: 1, green: 1, blue: 1, purple: 1 },
            orange:   { gray: 1, red: 1 },
            yellow:   { white: 1 },
            green:    { gray: 1, brown: 1, red: 1, blue: 1, purple: 1 },
            blue:     { black: 1, brown: 1, red: 1, green: 1, purple: 1 },
            purple:   { black: 1, gray: 1, brown: 1, red: 1, green: 1, blue: 1 }
        }
    },
    crayons: { //colors from http://en.wikipedia.org/wiki/List_of_Crayola_crayon_colors
        colors: { 
            red:     '#ee204d', 
            orange:  '#ff7538', 
            yellow:  '#fce883', 
            green:   '#1cac78', 
            blue:    '#1f75fe', 
            purple:  '#926eae',
            black:   '#000000', 
            white:   '#ffffff', 
            gray:    '#95918c', 
            brown:   '#b4674d', 
            cyan:    '#64aff6', 
            magenta: '#f664af', 
            pink:    '#ffaacc' 
        },
        dontPair: {
            red:      { orange: 1, green: 1, blue: 1, purple: 1, gray: 1, brown: 1, cyan: 1, magenta: 1, pink: 1 },
            orange:   { red: 1, green: 1, blue: 1, purple: 1, gray: 1, brown: 1, cyan: 1, magenta: 1, pink: 1 },
            yellow:   { white: 1 },
            green:    { red: 1, orange: 1, blue: 1, purple: 1, gray: 1, brown: 1, cyan: 1, magenta: 1 },
            blue:     { red: 1, orange: 1, green: 1, purple: 1, gray: 1, brown: 1, magenta: 1 },
            purple:   { red: 1, orange: 1, green: 1, blue: 1, gray: 1, brown: 1, cyan: 1, magenta: 1 },
            white:    { yellow: 1 },
            gray:     { red: 1, orange: 1, green: 1, blue: 1, purple: 1, brown: 1, cyan: 1, magenta: 1 },
            brown:    { red: 1, orange: 1, green: 1, blue: 1, purple: 1, gray: 1, cyan: 1, magenta: 1 },
            cyan:     { red: 1, orange: 1, green: 1, purple: 1, gray: 1, brown: 1, magenta: 1, pink: 1 },
            magenta:  { red: 1, orange: 1, green: 1, blue: 1, purple: 1, gray: 1, brown: 1, cyan: 1, pink: 1 },
            pink:     { red: 1, orange: 1, cyan: 1, magenta: 1 }
        }
    },
    grayscale: {
        colors: { 
            black: '#000', 
            dark:  '#444', 
            gray:  '#888', 
            light: '#ccc', 
            white: '#fff'
        },
        dontPair: {
            black: { dark: 1 },
            dark:  { black: 1, gray: 1 },
            gray:  { dark: 1, light: 1 },
            light: { gray: 1, white: 1 },
            white: { light: 1 }
        }
    },
    wood: { //colors from http://www.materialpalette.com/
        colors: {
            darkBrown:   '#5d4037',
            brown:       '#795548',
            darkOrange:  '#f57c00',
            orange:      '#ffc107',
            lightOrange: '#ffe0b2',
            lightGray:   '#d7ccc8',
            gray:        '#727272',
            darkGray:    '#212121'
        },
        dontPair: {
            darkBrown:   { brown: 1, gray: 1, darkGray: 1 },
            brown:       { darkBrown: 1, gray: 1, darkGray: 1 },
            darkOrange:  { orange: 1, gray: 1 },
            orange:      { darkOrange: 1, lightOrange: 1, lightGray: 1 },
            lightOrange: { orange: 1, lightGray: 1 },
            lightGray:   { orange: 1, lightOrange: 1 },
            gray:        { darkBrown: 1, brown: 1, darkOrange: 1 },
            darkGray:    { darkBrown: 1, brown: 1 }
        }

    },
    sea: { //colors from http://www.materialpalette.com/
        colors: {
            navy:     '#303f9f',
            deepSky:  '#03a9f4',
            lagoon:   '#00bcd4',
            lightSky: '#b3e5fc',
            seaGreen: '#009688',
            deepGray: '#212121',
            gray:     '#727272'
        },
        dontPair: {
            navy:     { deepGray: 1, gray: 1 },
            deepSky:  { lagoon: 1, seaGreen: 1 },
            lagoon:   { deepSky: 1, seaGreen: 1, gray: 1 },
            seaGreen: { deepSky: 1, lagoon: 1, gray: 1 },
            deepGray: { navy: 1 },
            gray:     { navy: 1, lagoon: 1, seaGreen: 1 }
        }
    },
    circus: { //colors from http://www.materialpalette.com/
        colors: {
            black:     '#212121',
            blue:      '#536dfe',
            darkGray:  '#727272',
            lightGray: '#b6b6b6',
            red:       '#f44336',
            orange:    '#fbc02d',
            yellow:    '#ffeb3b',
            white:     '#ffffff'
        },
        dontPair: {
            black:     { darkGray: 1 },
            blue:      { darkGray: 1, red: 1 },
            darkGray:  { black: 1, blue: 1, red: 1, orange: 1 },
            lightGray: { red: 1, orange: 1, yellow: 1 },
            red:       { blue: 1, darkGray: 1, lightGray: 1 },
            orange:    { lightGray: 1, yellow: 1, darkGray: 1 },
            yellow:    { orange: 1, white: 1, lightGray: 1 },
            white:     { yellow: 1 }
        }
    }
};

module.exports = palettes;
},{}],"rad-colorizer-getrandomcolorpair":[function(require,module,exports){
var palettes = require('./palettes');

/** 
 * Simple method for getting a pair of random colors via palette name.  Used by gh-pages index.html.
 */
function getRandomColorPair(paletteName) {
    var paletteObj = palettes[paletteName];
    var colorNames = Object.keys(paletteObj.colors);
    var fore;
    var back;
    while(!fore || !back || fore == back || 
      paletteObj.dontPair[fore][back] || paletteObj.dontPair[back][fore]) {
        fore = colorNames[Math.floor(Math.random() * colorNames.length)];
        back = colorNames[Math.floor(Math.random() * colorNames.length)];
        console.log('try ' + fore + ' ' + back);
    }
    console.log('win ' + fore + ' ' + back);
    return { foreground: fore, background: back };
}

module.exports = getRandomColorPair;
},{"./palettes":1}]},{},["rad-colorizer-getrandomcolorpair"]);
