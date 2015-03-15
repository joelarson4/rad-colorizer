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