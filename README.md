Synth
=====

Synth is a simple browser based synthesizer using the web audio API.

### Features
- Visual keyboard showing key mappings and keys pressed
- Octave range from 0 to 6
- Waveform visualizer
- Adjustable Delay, Attack, Decay, Sustain, Release amplitude envelope

### Version
1.0.0

### Tech
- gulp - streaming build system
- browserify - node style modules in the browser
- gulp-sourcemaps - allows for original source to be referenced from minified code
- gulp-uglify - code minifier/compressor

### Development
Install npm packages
```
npm install
```

To build the source files and output them to the dist folder
```
npm run build
```

### Todos
- allow waveform type to be changed
- add filter
- add LFO
- add master volume control

### License
MIT




