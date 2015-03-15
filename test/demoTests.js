var RadReveal = require('rad-reveal');
var slides = RadReveal.getSlideObjects();


describe('rad-colorizer tests', function() {
    it('has basic attachment of correct objects', function() { 
        slides.forEach(function(slide) {
            var hasAttr = slide.element.hasAttribute('data-rad-colorizer');
            assert.isTrue(hasAttr === (typeof slide.data.randomizer === 'object'), 'Slides with attribute have randomizer object');
            assert.isTrue(hasAttr === (typeof slide.data.getRandomizerFor === 'function'), 'Slides with attribute have getRandomizerFor function');

            if(!hasAttr) { return; }
            assert.isTrue((typeof slide.data.randomizer.random === 'function'), 'Randomizer has random method');
        });
    });

});