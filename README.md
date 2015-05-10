#rad-colorizer [![Build Status](https://travis-ci.org/joelarson4/rad-colorizer.svg)](https://travis-ci.org/joelarson4/rad-colorizer)
rad-colorizer is a [Reveal.js](http://lab.hakim.se/reveal-js/) [RadReveal](https://github.com/joelarson4/radReveal) add-on for automatically adding background and foreground colors to your slides.

Check out the [demo slideshow](http://joelarson4.github.io/rad-colorizer/demo.html) to see what rad-colorizer can do.

Check out [RadReveal](https://github.com/joelarson4/radReveal) to understand how these add-ons work.

##What does rad-colorizer do?

rad-colorizer can add varying background and foreground colors to your slides.  
Colors make your slide show more fun and visually interesting.
You can choose which colors to use or you can have them automatically selected randomly.

##How do you use it?

First you'll need to add [RadReveal](https://github.com/joelarson4/radReveal) to your slideshow.

Then you will need to intall the `rad-colorizer` script:

    cd <the root of your slideshow directory>
    npm install rad-colorizer

Then you will need to load the `rad-colorizer` script as a Reveal.js dependency:    

```javascript
Reveal.initialize({
  ...normal Reveal configuration goes here
  dependencies: [
    { src: 'node_modules/rad-colorizer/build/colorizer.js', radName: 'colorizer' }
    ...other dependencies go here
  ]
});

var RadReveal = require('rad-reveal');
RadReveal.initialize();
```

Finally, add a `data-rad-colorizer` attribute to any slide.  
Those slides will have a randomly selected background and foreground color assigned.  
The colors will change every time you reload the slideshow.

##What if you don't want colors changing every reload?

You can add the [`rad-randomizer`](https://github.com/joelarson4/rad-randomizer) add-on to your slideshow and use that to get random **seeming** color combinations for each slide.
But this randomizer can be seeded using the slide contents, so the color selection won't change from reload to reload.  
Just add the `data-rad-randomizer` attribute to each slide and set it according to the way you want the randomizer to be seeded; the colors will then be chosen using that seed every reload.

##What if you want to use a specific background or foreground?

Just add an attribute `data-rad-colorizer-background` and/or `data-rad-colorizer-foreground` and set it to the name of the color you want.

##What if you want to use a different color palette?

rad-colorizer ships with [several built-in palettes](palettes.md).
Add the `data-rad-colorizer-pallete` attribute to a slide and set it to one of the available palettes.  That palette will continue to be used for slides that follow.  

You can also specify that all slides use a particular palette from the start of the slideshow by setting `radConfig.palette` to the name of the palette you want when you load the script as a dependency:

```javascript
{ src: 'node_modules/rad-colorizer/build/colorizer.js', radName: 'colorizer', 
  radConfig: {
    palette: 'crayons'
  } 
}
```

Or, you can define your own palette to use by setting `radConfig.palette` to a palette object:

```javascript
...
{ src: 'node_modules/rad-colorizer/build/colorizer.js', radName: 'colorizer', 
  radConfig: {
    palette: { 
      name: 'dim',
      colors: { red: '#b00', blue: '#00b', green: '#0b0', cyan: '#088' },
      dontPair: { green: { cyan: 1 }, blue: { cyan: 1 }, cyan: { green: 1, blue: 1 } }
    }
  } 
}
...
```

Palette objects have these properties:

**name**: `string`, optional property, the name of the palette.  If left out, defaults to "custom".

**colors**: `object`, required property, a map of color names to hex values or to an allowed [CSS color keyword](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Color_keywords).

**dontPair**: `object`, optional property, a map with color names as keys, and values being maps of color names set to truthy values.  This is used to specify combinations of colors that should not be put together.

Finally, you can provide multiple palettes by setting `radConfig.palettes`.  This property should be set to a map of palette names to palette objects.  For example:

```javascript
  ...
  { src: 'node_modules/rad-colorizer/build/colorizer.js', radName: 'colorizer', 
    radConfig: {
      palettes: {
        dim: { 
          colors: { red: '#b00', blue: '#00b', green: '#0b0', cyan: '#088' },
          dontPair: { green: { cyan: 1 }, blue: { cyan: 1 }, cyan: { green: 1, blue: 1 } }
        },
        light: { 
          colors: { red: '#f66', blue: '#66f', green: '#6f6', cyan: '#6bb' },
          dontPair: { green: { cyan: 1 }, blue: { cyan: 1 }, cyan: { green: 1, blue: 1 } }
        }
      }
    } 
  }
  ...
```

Note that the palette name will be set to the name of the key that was used for it in `radConfig.palettes`.

