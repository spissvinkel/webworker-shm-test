# Web worker / shared memory test project

This is a very simple project to test the updating of a `SharedArrayBuffer` by several workers simultaneously.

The shared buffer will be used as a texture for a "full screen" quad rendered with WebGL


## Install dependencies (for development only)

```
$ npm install
```


## Start Webpack dev server

```
$ npm start
```

Then open http://localhost:9000/ in a browser


## Build "production" version

```
$ npm run build
```


## Just compile TS (`./src`) to JS (`./build`)

```
$ npx tsc
```


### License

Creative Commons Zero, CC0
http://creativecommons.org/publicdomain/zero/1.0/

This content is free to use in personal, educational and commercial projects
