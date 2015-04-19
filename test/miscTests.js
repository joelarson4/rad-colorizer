var RadReveal = require('rad-reveal');
var slides = RadReveal.getSlideObjects();


describe('rad-colorizer misc tests by config #' + mochaPhantomJS.env.TEST_NUMBER, function() {

    var test_it = function(test, desc, run) { 
        if(mochaPhantomJS.env.TEST_NUMBER.toString() !== test.toString()) { return; }
        it('Test with config ' + test + ' - ' + desc, run);
    }

    test_it(0, 'specify crayons & fillSlides', function() {
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-colorizer');
            assert.isTrue(hasAttr, 'fillSlides has added attribute');

            assert.equal(slide.data.colorizer.palette.name, 'crayons', 'Palette used is as named');
        });
    });

    test_it(1, 'provide dim palette', function() {
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-colorizer');
            var paletteObj = slide.data.colorizer.palette;

            assert.equal(paletteObj.name, 'dim', 'Palette used is as named');

            var foreground = (slide.element.className + ' ').split('-fore-')[1].split(' ')[0];
            var background = (slide.element.className + ' ').split('-back-')[1].split(' ')[0];
            assert.isTrue(!!paletteObj.colors[foreground], 'Foreground color is in the palette');
            assert.isTrue(!!paletteObj.colors[background], 'Background color is in the palette');
        });
    });

    test_it(2, 'provide dim-too-few-colors palette', function() {
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-colorizer');
            var paletteObj = slide.data.colorizer.palette;

            assert.equal(paletteObj.colors.red, 'red', 'Palette is uses standard colors because dim-too-few-colors has too few colors');

            var foreground = (slide.element.className + ' ').split('-fore-')[1].split(' ')[0];
            var background = (slide.element.className + ' ').split('-back-')[1].split(' ')[0];
            assert.isTrue(!!paletteObj.colors[foreground], 'Foreground color is in the palette');
            assert.isTrue(!!paletteObj.colors[background], 'Background color is in the palette');
        });
    });

});