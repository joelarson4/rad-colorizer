/*!
 * rad-colorizer
 * http://joelarson4.github.io/rad-colorizer
 * MIT licensed
 *
 * Copyright (C) 2015 Joe Larson
 */

/** 
 * @overview
 * rad-colorizer is a Reveal.js RadReveal add-on for automatically adding background and foreground colors to your slides.
 * Please see [project README](https://github.com/joelarson4/rad-colorizer) for an overview.
 *
 * This is not a true CommonJS module, you cannot `require()` it.  It should be loaded as a Reveal.js dependency.
 *
 *```javascript
 * Reveal.initialize({
 *    ...
 *    dependencies: [
 *        { src: '<some path>/colorizer.min.js', radName: 'colorizer' }
 *    ...
 *```
 *
 * @module colorizer
 */

//Developer note: we are not using jsdox to generate any markdown for this file; the API doesn't really suit it.  
//  Some JsDoc is still provided for developer use

var RadReveal = require('rad-reveal');
var palettes = require('./palettes');
var generatePaletteHtml = require('./generatePaletteHtml');

var previousBodyClassName;
var colors = [];
var config;
var counter = 0;
var styleEle = null;
var currentPalette = palettes.standard;
var revealElement = document.querySelector('.reveal');


/** 
 * Runs when RadReveal initializes.
 *
 * @param {object} config - configuration object set in radConfig.  See README for details.
 * @param {array} slides - all the slide objects
 * @private
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


//palette initialization.

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

        selector = '.reveal.' + getClassName(paletteObj, 'fore', fore) + ' .controls div.navigate-left';
        style.push(selector + ',' + selector + '.enabled {border-right-color:' + paletteObj.foregrounds[fore] + ';}\n');

        selector = '.reveal.' + getClassName(paletteObj, 'fore', fore) + ' .controls div.navigate-right';
        style.push(selector + ',' + selector + '.enabled {border-left-color:' + paletteObj.foregrounds[fore] + ';}\n');

        selector = '.reveal.' + getClassName(paletteObj, 'fore', fore) + ' .controls div.navigate-up';
        style.push(selector + ',' + selector + '.enabled {border-bottom-color:' + paletteObj.foregrounds[fore] + ';}\n');

        selector = '.reveal.' + getClassName(paletteObj, 'fore', fore) + ' .controls div.navigate-down'; 
        style.push(selector + ',' + selector + '.enabled {border-top-color:' + paletteObj.foregrounds[fore] + ';}\n');

        selector = '.reveal.' + getClassName(paletteObj, 'fore', fore) + ' .progress span';
        style.push(selector + ' {background:' + paletteObj.foregrounds[fore] + ';}\n');

    });
    Object.keys(paletteObj.backgrounds).forEach(function(back) {
        var selector = '.reveal .backgrounds .' + getClassName(paletteObj, 'back', back);
        style.push(selector + ' {background-color:' + paletteObj.backgrounds[back] + ';}\n');
    });
    styleEle.innerHTML += style.join('');
}


//randomization functionality:

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


/**
 * Return a color pair index for a particular slide by using it's randomization attributes (either truly
 * random or from rad-randomizer) and from the palette assigned to that slide.
 *
 * @param {object} slideObj - the RadReveal slide object
 * @param {string=} useForeground - name of a color in the slide's palette foregrounds to force it to be used
 * @param {string=} useBackground - name of a color in the slide's palette backgrounds to force it to be used
 */
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


//core events

function show(attrVal, slideObj, event, radEventName) {
    if(!slideObj.data.colorizer || !slideObj.data.colorizer.foreground || !slideObj.data.colorizer.palette) {
        return;
    }
    revealElement.className += ' ' + getClassName(slideObj.data.colorizer.palette, 'fore', slideObj.data.colorizer.foreground.name);
}

function hide(attrVal, slideObj, event, radEventName) {
    if(!slideObj.data.colorizer || !slideObj.data.colorizer.foreground || !slideObj.data.colorizer.palette) {
        return;
    }

    revealElement.className = revealElement.className.replace(getClassName(slideObj.data.colorizer.palette, 'fore', slideObj.data.colorizer.foreground.name), '');
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
RadReveal.on('data-rad-colorizer', 'show', show);
RadReveal.on('data-rad-colorizer', 'hide', hide);