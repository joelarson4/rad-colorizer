require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/larsonj/Sites/radReveal/rad-colorizer/src/colorizer.js":[function(require,module,exports){
var RadReveal = require('rad-reveal');
var palettes = require('./palettes');
var generatePaletteHtml = require('./generatePaletteHtml');

//note: http://www.materialpalette.com/
//note:http://jsbin.com/jabinozequ/1/edit?html,css,js,output
//note:http://jsbin.com/pokiramihu

var previousBodyClassName;
var colors = [];
var config;
var counter = 0;
var styleEle = null;
var currentPalette = palettes.standard;

function setupPalettePairs(paletteObj) {
    Object.keys(paletteObj.foregrounds).sort().forEach(function(fore) {
        Object.keys(paletteObj.backgrounds).sort().forEach(function(back) {
            if(fore == back) return;
            if((paletteObj.dontPair[fore] && paletteObj.dontPair[fore][back])
                || (paletteObj.dontPair[back] && paletteObj.dontPair[back][fore])) {
                return;
            }
            paletteObj.pairs.push({ 
                background: { name: back, color: paletteObj.backgrounds[back] },
                foreground: { name: fore, color: paletteObj.foregrounds[fore] }
            });
            if(!paletteObj.pairForBackground[back]) { paletteObj.pairForBackground[back] = []; }
            paletteObj.pairForBackground[back].push(paletteObj.pairs.length - 1); //pairIndex
            if(!paletteObj.pairForForeground[fore]) { paletteObj.pairForForeground[fore] = []; }
            paletteObj.pairForForeground[fore].push(paletteObj.pairs.length - 1); //pairIndex
        });
    });
}

function setupPalette(paletteObj) {
    if(!paletteObj.colors || Object.keys(paletteObj.colors).length < 3) {
        console.log('Palettes must contain at least three colors; ' + paletteObj.name + ' doesn\'t; defaulting to standard colors');
        paletteObj.colors = palettes.standard.colors;
    }
    paletteObj.pairs = paletteObj.pairs || [];
    paletteObj.foregrounds = paletteObj.foregrounds || paletteObj.colors;
    paletteObj.backgrounds = paletteObj.backgrounds || paletteObj.colors;
    paletteObj.dontPair = paletteObj.dontPair || {};
    paletteObj.pairForBackground = {};
    paletteObj.pairForForeground = {};
    paletteObj.toHtml = function() { return generatePaletteHtml(this); };
    palettes[paletteObj.name] = paletteObj;

    setupPalettePairs(paletteObj);

    if(paletteObj.pairs < 3) {
        console.log('Palettes must have at least three available pairs; ' + paletteObj.name + ' doesn\'t; ignoring dontPair.');
        paletteObj.dontPair = {};
        setupPalettePairs(paletteObj);
    }

    var style = [];
    Object.keys(paletteObj.foregrounds).forEach(function(fore) {
        var selector = '.reveal .' + getClassName(paletteObj, 'fore', fore);
        style.push(selector + ',' + selector + ' * {color:' + paletteObj.foregrounds[fore] + ';}\n');
    });
    Object.keys(paletteObj.backgrounds).forEach(function(back) {
        var selector = '.reveal .backgrounds .' + getClassName(paletteObj, 'back', back);
        style.push(selector + ' {background-color:' + paletteObj.backgrounds[back] + ';}\n');
    });
    styleEle.innerHTML += style.join('');
}

/**
 colors: [xxx, yyy, zzz],
 foregrounds: [xxx, yyy, zzz],
 backgrounds: [xxx, yyy, zzz],
 pairs: [ { foreground: xxx, background: zzz }, { foreground: yyy, background: xxx} ]
 palettes = { name : object }
*/
function initialize(inputConfig, slides) {
    config = inputConfig || {};

    document.head.innerHTML += '<style id="rad-colorizer-css"></style>';
    styleEle = document.querySelector('#rad-colorizer-css');

    if(typeof config.palettes === 'object') {
        Object.keys(config.palettes).forEach(function(paletteName) {
            palettes[paletteName] = config.palettes[paletteName];
        });
    }

    if(typeof config.palette === 'object') {
        var paletteName = config.palette.name || 'custom';
        palettes[paletteName] = config.palette;
        currentPalette = config.palette;
    }

    Object.keys(palettes).forEach(function(paletteName) {
        palettes[paletteName].name = paletteName;
        setupPalette(palettes[paletteName]);
    });

    if(typeof config.palette === 'string') {
        if(palettes[config.palette]) {
            currentPalette = palettes[config.palette];
        } else {
            console.log('There is no ' + config.palette + ' palette; using standard.');
        }
    }

    if(config.fillSlides) {
        slides.forEach(function(slide) {
            if(!slide.element.hasAttribute('data-rad-colorizer')) {
                slide.element.setAttribute('data-rad-colorizer', config.fillSlides);
            }
        });
    }
}

var actuallyRandom = {
    random: function(min, max) {
        return Math.floor((max - min) * Math.random() + min);
    }
}

function getRandomPairIndex(slideObj, useForeground, useBackground) {
    var pairIndex;
    var randomizer = actuallyRandom;
    if(slideObj.data.randomizer) { //use the randomizer rad addon
        if(!slideObj.data.colorizer.randomizer) {
            slideObj.data.colorizer.randomizer = slideObj.data.getRandomizerFor('colorizer');
        }
        randomizer = slideObj.data.colorizer.randomizer;
    }

    var paletteObj = slideObj.data.colorizer.palette;

    if(useForeground && !useBackground) {
        pairIndex = paletteObj.pairForForeground[useForeground][randomizer.random(0, paletteObj.pairForBackground[useForeground].length)];
    } else if(useBackground && !useForeground) {
        pairIndex = paletteObj.pairForBackground[useBackground][randomizer.random(0, paletteObj.pairForBackground[useBackground].length)];
    } else {
        pairIndex = randomizer.random(0, paletteObj.pairs.length);
    }

    return pairIndex;
}

function getPairIndex(slideObj, useForeground, useBackground) {
    var pairIndex = getRandomPairIndex(slideObj, useForeground, useBackground);

    //don't bother to check for matching previous if no previous colorized slide or repeat is allowed
    if(!slideObj.prevSlideObj || !slideObj.prevSlideObj.data.colorizer || config.allowBackgroundRepeat) {
        return pairIndex;
    }

    //don't bother checking repeat if same randomizer
    if(slideObj.prevSlideObj.data.randomizer && slideObj.data.randomizer &&
        slideObj.prevSlideObj.data.randomizer.seed == slideObj.data.randomizer.seed) {
        return pairIndex;
    }
    
    //otherwise check for previous background
    previousBackgroundColor = slideObj.prevSlideObj.data.colorizer.background.name;
    while(slideObj.data.colorizer.palette.pairs[pairIndex].background.name == previousBackgroundColor) {
        pairIndex = getRandomPairIndex(slideObj, useForeground, useBackground);
    }
    return pairIndex;
}


function load(attrVal, slideObj, event, radEventName) {
    slideObj.data.colorizer = slideObj.data.colorizer || { };
    var switchPalette = slideObj.element.getAttribute('data-rad-colorizer-palette');
    if(switchPalette) {
        if(palettes[switchPalette]) {
            currentPalette = palettes[switchPalette];
        } else {
            console.log('There is no ' + switchPalette + ' palette');
        }
    }
    slideObj.data.colorizer.palette = currentPalette;

    var pairIndex = getPairIndex(slideObj, null, null);

    slideObj.data.colorizer.background = currentPalette.pairs[pairIndex].background;
    slideObj.data.colorizer.foreground = currentPalette.pairs[pairIndex].foreground;

    var useBackground = slideObj.element.getAttribute('data-rad-colorizer-background');
    var useForeground = slideObj.element.getAttribute('data-rad-colorizer-foreground');

    if(useBackground && !currentPalette.backgrounds[useBackground]) {
        console.log('There is no ' + useBackground + ' background in the ' + currentPalette.name + ' palette');
        useBackground = null;
    }
    if(useBackground) {
        slideObj.data.colorizer.background = { name: useBackground, color: currentPalette.backgrounds[useBackground] };

        if(!useForeground) {
            slideObj.data.colorizer.foreground = getPairIndex(slideObj, null, useBackground);
        }
    }

    if(useForeground && !currentPalette.foregrounds[useForeground]) {
        console.log('There is no ' + useForeground + ' foreground in the ' + currentPalette.name + ' palette');
        useForeground = null;
    }
    if(useForeground) {
        slideObj.data.colorizer.foreground = { name: useForeground, color: currentPalette.foregrounds[useForeground] };
    }

    slideObj.element.className+= 
        ' ' + getClassName(currentPalette, 'fore', slideObj.data.colorizer.foreground.name) +
        ' ' + getClassName(currentPalette, 'back', slideObj.data.colorizer.background.name);
}

function getClassName(palette, type, name) {
    return 'rad-colorizer-' + palette.name + '-' + type + '-' + name; 
}

RadReveal.register('colorizer', initialize);
RadReveal.on('data-rad-colorizer', 'load', load);
},{"./generatePaletteHtml":1,"./palettes":2,"rad-reveal":"rad-reveal"}],1:[function(require,module,exports){
function generatePaletteHtml(paletteObj) {
    var html = [];
    Object.keys(paletteObj.colors).sort().forEach(function(back) {
        Object.keys(paletteObj.colors).sort().forEach(function(fore) {
            if(fore != back && 
              (typeof paletteObj.dontPair[fore]=='undefined' || !paletteObj.dontPair[fore][back]) && 
              (typeof paletteObj.dontPair[back]=='undefined' || !paletteObj.dontPair[back][fore])) {
                html.push('<span class="colorizer-palette-pair" style="color: ' + paletteObj.colors[fore] + 
                    '; background-color: ' +paletteObj.colors[back] + '">' + 
                    fore + '<br>on</br>' + back + 
                    '</span>');
            }
        });
    });
    return html.join('');
}

module.exports = generatePaletteHtml;
},{}],2:[function(require,module,exports){
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
            black: 'black', 
            dark:  '#444', 
            gray:  '#888', 
            light: '#ccc', 
            white: 'white'
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
            darkGray:  { black: 1, blue: 1, red: 1 },
            lightGray: { red: 1, orange: 1 },
            red:       { blue: 1, darkGray: 1, lightGray: 1 },
            orange:    { lightGray: 1, yellow: 1 },
            yellow:    { orange: 1, white: 1 },
            white:     { yellow: 1 }
        }
    }
};

module.exports = palettes;
},{}]},{},["/Users/larsonj/Sites/radReveal/rad-colorizer/src/colorizer.js"]);
