import htmllint from 'htmllint';
import fs from 'fs-extra';
import { parseQuery } from 'loader-utils';
import assign from 'object-assign';
import chalk from 'chalk';
import deasync from 'deasync';

function lint(source, options, webpack) {
    const lintOptions = fs.readJsonSync(options.config);
    const content = fs.readFileSync(options.resourcePath, 'utf8');
    const messages = [];
    let message = '';
    let done = false;

    htmllint(content, lintOptions).then((issues) => {
        for (const issue of issues) {
            message = issue.msg || htmllint.messages.renderIssue(issue);

            if (message) {
                messages.push([
                    chalk.magenta(options.resourcePath), ': ',
                    'line ', issue.line, ', ',
                    'col ', issue.column, ', ',
                    chalk.red(message),
                    '\n',
                ].join(''));
            }
        }

        done = true;
    });

    deasync.loopWhile(() => !done);

    if (messages.length > 0) {
        webpack.emitError(messages.join(''));
    }
}

module.exports = function htmlLint(source) {
    const options = assign(
        {
            config: '.htmllintrc',
            failOnError: true,
            failWarning: false,
        },
        parseQuery(this.query)
    );

    options._cwd = process.cwd();

    if (this.resourcePath.indexOf(options._cwd) === 0) {
        options.resourcePath = this.resourcePath.substr(options._cwd.length + 1);
    }

    lint(source, options, this);

    return source;
};

