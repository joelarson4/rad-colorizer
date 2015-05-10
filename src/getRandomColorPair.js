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