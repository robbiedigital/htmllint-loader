'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _deasync = require('deasync');

var _deasync2 = _interopRequireDefault(_deasync);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _htmllint = require('htmllint');

var _htmllint2 = _interopRequireDefault(_htmllint);

var _loaderUtils = require('loader-utils');

var _textTable = require('text-table');

var _textTable2 = _interopRequireDefault(_textTable);

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isFile = function isFile(file) {
  try {
    return _fsExtra2.default.lstatSync(file).isFile();
  } catch (e) {
    return false;
  }
};

var cleanContent = function cleanContent(content) {
  var lines = content.split('\n');

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = lines.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _step$value = _slicedToArray(_step.value, 2),
          i = _step$value[0],
          line = _step$value[1];

      line = line.replace(/="{{.*}}"/, '="temp"');
      line = line.replace(/="{{{.*}}}"/, '="temp"');
      line = line.replace('<?php', '    ');
      line = line.replace('<?=', '   ');
      line = line.replace('<?', '  ');
      line = line.replace('<%', '  ');
      line = line.replace('%>', '  ');
      line = line.replace('?>', '  ');
      line = line.replace(/{{.*}}/g, '');
      line = line.replace(/{{{.*}}}/g, '');
      lines[i] = line;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return lines.join('\n');
};

var pluralize = function pluralize(_word, count) {
  var word = _word;

  if (count > 1) {
    word += 's';
  }

  return word;
};

var stylish = function stylish(results) {
  var errors = 0;
  var warnings = 0;
  var output = '';
  var total = 0;
  var summaryColor = 'yellow';
  var messages = null;
  var filename = null;
  var tableOptions = null;
  var fileOutput = null;
  var styledOutput = null;
  var tableLayout = null;
  var format = null;

  results.forEach(function (file) {
    messages = file.messages;
    filename = _chalk2.default.underline(file.filePath);
    tableOptions = {
      align: ['', '  ', 'r', 'l'],
      stringLength: function stringLength(str) {
        return _chalk2.default.stripColor(str).length;
      }
    };

    fileOutput = '\n';

    if (messages.length === 0) {
      return;
    }

    total += messages.length;
    styledOutput = messages.map(function (message) {
      var messageType = 'unknown';

      if (message.severity === 'error') {
        messageType = _chalk2.default.red('error');
        errors = errors + 1;
      } else {
        messageType = _chalk2.default.yellow('warning');
        warnings = warnings + 1;
      }

      return ['', _chalk2.default.dim(message.line + ':' + message.column), messageType, _chalk2.default.dim(message.linter || ''), message.reason.replace(/\.$/, '')];
    });
    tableLayout = (0, _textTable2.default)(styledOutput, tableOptions);
    format = tableLayout.split('\n');
    format = format.join('\n') + '\n\n';
    fileOutput += filename + '\n';
    fileOutput += format;
    output += fileOutput;
  });

  if (total > 0) {
    var _bold = ['\u2716 ', total, pluralize(' problem', total), ' (', errors, pluralize(' error', errors), ', ', warnings, pluralize(' warning', warnings), ')\n'];

    if (errors > 0) {
      summaryColor = 'red';
    }

    output += _chalk2.default[summaryColor].bold(_bold.join(''));
  }

  return {
    message: total > 0 ? output : '',
    warnings: warnings,
    errors: errors
  };
};

var lint = function lint(source, options, webpack) {
  var messages = [];
  var lintOptions = _config.defaultOptions;
  var done = false;
  var content = _fsExtra2.default.readFileSync(options.resourcePath, 'utf8');

  if (isFile(options.config)) {
    lintOptions = (0, _objectAssign2.default)(lintOptions, _fsExtra2.default.readJsonSync(options.config));
  }

  content = cleanContent(content);

  (0, _htmllint2.default)(content, lintOptions).then(function (issues) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = issues[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var issue = _step2.value;

        messages.push({
          line: issue.line,
          column: issue.column,
          length: 0,
          severity: _config.severity[issue.rule],
          reason: _htmllint2.default.messages.renderIssue(issue),
          linter: issue.rule
        });
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    done = true;
  }, function (err) {
    messages.push({
      line: 0,
      column: 0,
      length: 0,
      severity: 'warning',
      reason: err.message,
      linter: 'unknown'
    });

    done = true;
  });

  _deasync2.default.loopWhile(function () {
    return !done;
  });

  if (messages.length > 0) {
    var formatted = stylish([{
      filePath: options.resourcePath,
      messages: messages
    }]);

    if (formatted.errors > 0) {
      if (options.failOnError) {
        webpack.emitError(formatted.message);

        if (process.env.NODE_ENV === 'production') {
          throw new Error('Module failed because of a htmllint errors.\n ' + formatted.message);
        }
      } else {
        webpack.emitWarning(formatted.message);
      }
    } else if (formatted.warnings > 0) {
      if (options.failOnWarning) {
        webpack.emitError(formatted.message);

        if (process.env.NODE_ENV === 'production') {
          throw new Error('Module failed because of a htmllint warnings.\n ' + formatted.message);
        }
      } else {
        webpack.emitWarning(formatted.message);
      }
    }
  }

  // if (res[0].messages.length > 0) {
  //   const msg = this.stylish(res);
  //   let type = 'warnings';
  //
  //   if (self.errors > 0) {
  //     if (self.options.failOnError) {
  //       type = 'errors';
  //     }
  //   } else if (self.warnings > 0) {
  //     if (self.options.failOnWarning) {
  //       type = 'errors';
  //     }
  //   }
  //
  //   compilation[type].push(new Error(msg));
  //
  //   if (compilation.bail) {
  //     throw new Error(`Module failed because of a scsslint ${type}.\n ${msg}`);
  //   }
  // }
};

module.exports = function htmlLint(source) {
  var options = (0, _objectAssign2.default)({
    config: '.htmllintrc',
    failOnError: true,
    failWarning: false
  }, (0, _loaderUtils.parseQuery)(this.query));

  options._cwd = process.cwd();

  if (this.resourcePath.indexOf(options._cwd) === 0) {
    options.resourcePath = this.resourcePath.substr(options._cwd.length + 1);
  }

  lint(source, options, this);

  return source;
};