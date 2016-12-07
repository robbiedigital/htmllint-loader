'use strict';

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function lint(source, options, webpack) {
    var lintOptions = _fsExtra2.default.readJsonSync(options.config);
    var content = _fsExtra2.default.readFileSync(options.resourcePath, 'utf8');
    var messages = [];
    var message = '';
    var done = false;

    (0, _htmllint2.default)(content, lintOptions).then(function (issues) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = issues[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var issue = _step.value;

                message = issue.msg || _htmllint2.default.messages.renderIssue(issue);

                if (message) {
                    messages.push([_chalk2.default.magenta(options.resourcePath), ': ', 'line ', issue.line, ', ', 'col ', issue.column, ', ', _chalk2.default.red(message), '\n'].join(''));
                }
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
    });

    _deasync2.default.loopWhile(function () {
        return !done;
    });

    if (messages.length > 0) {
        webpack.emitError(messages.join(''));
    }
}

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