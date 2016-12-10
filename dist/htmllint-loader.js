'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _htmllint = require('htmllint');

var _htmllint2 = _interopRequireDefault(_htmllint);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _loaderUtils = require('loader-utils');

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _deasync = require('deasync');

var _deasync2 = _interopRequireDefault(_deasync);

var _htmlTags = require('html-tags');

var _htmlTags2 = _interopRequireDefault(_htmlTags);

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
    var pattern = '';
    var replace = '';

    _lodash2.default.forEach(lines, function (line, i) {
        lines[i] = lines[i].replace('<?php', '');
        lines[i] = lines[i].replace('<?=', '');
        lines[i] = lines[i].replace('<?', '');
        lines[i] = lines[i].replace('?>', '');

        _lodash2.default.forEach(_htmlTags2.default, function (tag) {
            if (tag.toLowerCase() !== 'title') {
                pattern = new RegExp('(<' + tag + '>).*(</' + tag + '>)');
                replace = '<' + tag + '></' + tag + '>';

                lines[i] = lines[i].replace(pattern, replace);
            }
        });
    });

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
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = issues[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var issue = _step.value;

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

        if (formatted.errors > 0 && options.failOnError) {
            webpack.emitError(formatted.message);
        } else if (formatted.warnings > 0 && options.failOnWarning) {
            webpack.emitError(formatted.message);
        } else if (formatted.warnings > 0) {
            webpack.emitWarning(formatted.message);
        }
    }
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