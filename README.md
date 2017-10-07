> [htmllint loader](https://github.com/TheBlackBolt/htmllint-loader) for webpack 1, 2 and 3

## [Install](https://github.com/TheBlackBolt/htmllint-loader)

```console
$ npm install htmllint-loader
or
$ yarn add htmllint-loader
```

## Example
Example handlebars/php code:

![](http://i.imgur.com/npHAmEy.png)

Example error:

![](http://i.imgur.com/y3Ys8Au.png)

## ignore code
You can go ahead and ignore single and multiple lines of code.
You can write the disable statement inside of html, handlebars, or ejs comments.
```html
<h1>Main Title</h1> {{!htmllint:disable-line}}
<h3>Multi-Column</h3> <!-- htmllint:disable-line -->
<%# htmllint:disable %>
<ul>
  <li><a href="2-column">2 Column</a></li>
  <li><a href="3-column">3 Column</a></li>
  <li><a href="4-column">4 Column</a></li>
  <li><a href="5-column">5 Column</a></li>
  <li><a href="6-column">6 Column</a></li>
</ul>
<%# htmllint:enable %>
```

## Webpack 1.x Usage
[Documentation: using loaders](http://webpack.github.io/docs/using-loaders.html)

Within your webpack configuration, you'll need to add the htmllint-loader to the list of module preloaders:

```javascript
module.exports = {
  // ...
  module: {
    loaders: [
      {
          test: /\(htm|html|xhtml|hbs|handlebars|php|ejs)$/,
          loader: "htmllint-loader",
          include: '_src/markup/',
      },
    ],
  },
  // ...
}
```

Optional query options:

```javascript
module.exports = {
  // ...
  module: {
    loaders: [
      {
        test: /\(htm|html|xhtml|hbs|handlebars|php|ejs)$/,
        loader: "htmllint-loader",
        include: '_src/markup/',
        query: {
          config: '.htmllintrc',
          failOnError: true,
          failOnWarning: false,
        },
      },
    ],
  },
  // ...
}
```

## Webpack 2.x & 3.x Usage
[Documentation: using loaders](https://webpack.js.org/concepts/loaders/)

Within your webpack configuration, you'll need to add the htmllint-loader to the list of module rules:

```javascript
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /(htm|html|xhtml|hbs|handlebars|php|ejs)$/,
        loader: 'htmllint-loader',
        exclude: /(node_modules)/,
      },
    ]
  },
  // ...
}
```

Optional query options:

```javascript
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /(htm|html|xhtml|hbs|handlebars|php|ejs)$/,
        loader: 'htmllint-loader',
        exclude: /(node_modules)/,
        query: {
          config: '.htmllintrc', // path to custom config file
          failOnError: false,
          failOnWarning: false,
        },
      },
    ]
  },
  // ...
}
```

## .htmllintrc
`.htmllintrc` should live in your project root. This file should be a valid JSON file that contains options defined
[on the htmllint wiki](https://github.com/htmllint/htmllint/wiki/Options).

Default htmllint-loader rules:

```json
{
    "attr-bans": [
        "align",
        "background",
        "bgcolor",
        "border",
        "dynsrc",
        "frameborder",
        "longdesc",
        "lowsrc",
        "onclick",
        "ondblclick",
        "onload",
        "marginwidth",
        "marginheight",
        "scrolling",
        "style",
        "width",
        "height"
    ],
    "attr-name-ignore-regex": false,
    "attr-name-style": "dash",
    "attr-new-line": false,
    "attr-no-dup": true,
    "attr-no-unsafe-char": true,
    "attr-order": false,
    "attr-quote-style": "double",
    "attr-req-value": false,
    "attr-validate": false,
    "class-no-dup": true,
    "class-style": "bem",
    "doctype-first": false,
    "doctype-html5": false,
    "fig-req-figcaption": true,
    "focusable-tabindex-style": false,
    "head-req-title": true,
    "head-valid-content-model": true,
    "href-style": false,
    "html-req-lang": true,
    "html-valid-content-model": false,
    "id-class-ignore-regex": false,
    "id-class-no-ad": true,
    "id-class-style": "dash",
    "id-no-dup": true,
    "img-req-alt": "allownull",
    "img-req-src": false,
    "indent-style": "spaces",
    "indent-width": 2,
    "indent-width-cont": true,
    "input-radio-req-name": true,
    "input-req-label": false,
    "label-req-for": false,
    "lang-style": "case",
    "line-end-style": false,
    "line-max-len": false,
    "line-max-len-ignore-regex": "/href/g",
    "maxerr": false,
    "raw-ignore-regex": false,
    "spec-char-escape": false,
    "table-req-caption": false,
    "table-req-header": false,
    "tag-bans": [
        "b",
        "keygen",
        "style"
    ],
    "tag-close": true,
    "tag-name-lowercase": true,
    "tag-name-match": true,
    "tag-self-close": "always",
    "text-ignore-regex": false,
    "title-max-len": 80,
    "title-no-dup": true
}
```
