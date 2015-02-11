# ng.cx.config
[![Build Status: Linux](http://img.shields.io/travis/ef-ctx/ng.cx.config/master.svg?style=flat-square)](https://travis-ci.org/ef-ctx/ng.cx.config)
[![Bower version](http://img.shields.io/bower/v/ng.cx.config.svg?style=flat-square)](git@github.com:ef-ctx/ng.cx.config.git)

> AngularJS configuration provider and service.


## Getting Started

Add **ng.cx.config** to you project.

Via bower:

```
$ bower install --save ng.cx.config
```

Include the following JS files in your build:
- `dist/ng.cx.config.js` OR `dist/ng.cx.config.min.js`


## Quick Guide


### Storing configuration in cxConfigProvider

The `ng.cx.config` module provides a provider to store your app-wide configuration and configure other providers
during the config phase of the app.

AngularJs is not very *async friendly* until the app is actual running so if you are loading this configuration from an
API you are better off doing it with bare-bones XHR before you actually bootstrap the app and then storing it in global
scope (yuck!).

```javascript
clConfigProvider.merge(window.config);
```

This is a bad idea both because it will delay your app bootstrap until the XHR request complete and because you are
relaying data to the app via the global scope.

Our advice is to template your config into an angular module that defines a constant and then load it into the config.

```javascript
app.value('configData', {....});

...

app.config(['configData', function(configData) {
    clConfigProvider.merge(window.config);
}]);
```


### Using the cxConfigProvider to configure services (config phase)

To read data, you can use a convenient dot notation to *deep read* configuration values.

All retrieved configuration is a deep clone of the actual stored data, so you don't risk modifying the configuration
after retrieving objects from it.

```javascript
someServiceProvider.configure(clConfigProvider.get('foo.bar.someServiceSettings'));
```


### Using the cxConfig service to retrieve data (run phase)

If you have controllers, directives or services not wrapped in their own providers that need configuration data you will
need to read the config data during the run phase of the app.

```javascript
module.controller('someController', ['cxConfig' , function (cxConfig) {
    var bar = cxConfig.get('foo.bar');
});

```

### Strictness and defaults

If some data is only available under some circumstances - such as a specific environmnt - you can provide a default as
a second parameter to `cxConfig.get()` to avoid getting an error while reading.

Any value will behave as a fallback, even `null` or `undefined`.

```javascript
module.controller('someController', ['cxConfig' , function (cxConfig) {
    var baz = cxConfig.get('foo.baz', 'default');
});
```

**Note:** the fallback is only used if the missing value corresponds to last segment of the equested path.

Given the following data:

```javascript
foo: {
  bar: {
    baz: 42
  }
}
```

- `get('foo.bar.qux')` results in an **error**.
- `get('foo.bar.qux', 'fallback')` results in `'fallback'`.
- `get('foo.qux.quux', 'fallback')`, always results in an **error**, regardless of a fallback being provided.


## Contributing

We'd love for you to contribute to our source code and to make it even better than it is today!

Make sure you read the [Contributing Guide](CONTRIBUTING.md) first.


## Developing

Clone this repository, install the dependencies and simply run `grunt develop`.

```
$ npm install -g grunt-cli bower
$ npm install
$ bower install
$ ./bootstrap.sh
$ grunt develop
```

At this point, the source examples included were built into the `build/` directory and a simple webserver is launched so
that you can browse the documentation, the examples and the code coverage.


## [MIT License](LICENSE)

[Copyright (c) 2005 EF CTX](https://raw.githubusercontent.com/EFEducationFirstMobile/oss/master/LICENSE)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
