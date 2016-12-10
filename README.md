> htmllint loader for webpack for [scss-lint](https://github.com/TheBlackBolt/htmllint-loader)

## [Install](https://github.com/TheBlackBolt/htmllint-loader)

```console
$ npm install scsslint-hot-loader
or
$ yarn add htmllint-loader
```

## Usage
[Documentation: using loaders](http://webpack.github.io/docs/using-loaders.html)

Within your webpack configuration, you'll need to add the scsslint-loader to the list of modules:

```javascript
module.exports = {
  // ...
  module: {
    preloaders: [
      {
          test: /\(htm|html|xhtml|hbs|handlebars|php)$/,
          loader: "htmllint-loader",
          include: '_src/markup/',
      }
    ]
  }
  // ...
}
```

Optional query parameters:

```javascript
module.exports = {
  // ...
  module: {
    preloaders: [
      {
        test: /\(htm|html|xhtml|hbs|handlebars|php)$/,
        loader: "htmllint-loader",
        include: '_src/markup/',
        query: {
          config: '.htmllintrc',
          failOnError: true,
          failOnWarning: false,
          quiet: false,
        }
      }
    ]
  }
  // ...
}
```

## .htmllintrc
`.htmllintrc` should live in your project root. This file should be a valid JSON file that contains options defined
[on the htmllint wiki](https://github.com/htmllint/htmllint/wiki/Options).

Default htmllint-loader options:

```javascript
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
      "width"
  ],
  "attr-name-ignore-regex": false,
  "attr-name-style": "dash",
  "attr-no-dup": true,
  "attr-no-unsafe-chars": true,
  "attr-quote-style": "double",
  "attr-req-value": true,
  "class-no-dup": true,
  "class-style": "dash",
  "csslint": false,
  "doctype-first": false,
  "doctype-html5": false,
  "fig-req-figcaption": true,
  "focusable-tabindex-style": false,
  "head-req-title": true,
  "href-style": false,
  "html-req-lang": true,
  "id-class-ignore-regex": false,
  "id-class-no-ad": true,
  "id-class-style": "underscore",
  "id-no-dup": true,
  "input-radio-req-name": true,
  "img-req-alt": true,
  "img-req-src": true,
  "indent-style": "spaces",
  "indent-width": 2,
  "indent-width-cont": true,
  "input-req-label": false,
  "label-req-for": true,
  "lang-style": "case",
  "line-end-style": "lf",
  "line-max-len": 120,
  "line-max-len-ignore-regex": "/href/g",
  "page-title": true,
  "spec-char-escape": true,
  "table-req-caption": false,
  "table-req-header": true,
  "tag-bans": [
      "b",
      "i",
      "keygen",
      "style"
  ],
  "tag-close": true,
  "tag-name-lowercase": true,
  "tag-name-match": true,
  "tag-self-close": "never",
  "text-escape-spec-char": true,
  "title-max-len": 60,
  "title-no-dup": true
}
```
