import _ from 'lodash';
import assign from 'object-assign';
import chalk from 'chalk';
import deasync from 'deasync';
import fs from 'fs-extra';
import htmllint from 'htmllint';
import { parseQuery } from 'loader-utils';
import tags from 'html-tags';
import table from 'text-table';

import { defaultOptions, severity } from './config';

const isFile = (file) => {
    try {
        return fs.lstatSync(file).isFile();
    } catch (e) {
        return false;
    }
};

const cleanContent = (content) => {
    const lines = content.split('\n');
    let pattern = '';
    let replace = '';

    _.forEach(lines, (line, i) => {
        lines[i] = lines[i].replace('<?php', '    ');
        lines[i] = lines[i].replace('<?=', '   ');
        lines[i] = lines[i].replace('<?', '  ');
        lines[i] = lines[i].replace('?>', '  ');

        _.forEach(tags, tag => {
            if (tag.toLowerCase() !== 'title') {
                pattern = new RegExp(`(<${tag}>).*(<\/${tag}>)`);
                replace = `<${tag}></${tag}>`;

                lines[i] = lines[i].replace(pattern, replace);
            }
        });
    });

    return lines.join('\n');
};

const pluralize = (_word, count) => {
    let word = _word;

    if (count > 1) {
        word += 's';
    }

    return word;
};

const stylish = (results) => {
    let errors = 0;
    let warnings = 0;
    let output = '';
    let total = 0;
    let summaryColor = 'yellow';
    let messages = null;
    let filename = null;
    let tableOptions = null;
    let fileOutput = null;
    let styledOutput = null;
    let tableLayout = null;
    let format = null;

    results.forEach((file) => {
        messages = file.messages;
        filename = chalk.underline(file.filePath);
        tableOptions = {
            align: ['', '  ', 'r', 'l'],
            stringLength: function stringLength(str) {
                return chalk.stripColor(str).length;
            },
        };

        fileOutput = '\n';

        if (messages.length === 0) {
            return;
        }

        total += messages.length;
        styledOutput = messages.map((message) => {
            let messageType = 'unknown';

            if (message.severity === 'error') {
                messageType = chalk.red('error');
                errors = errors + 1;
            } else {
                messageType = chalk.yellow('warning');
                warnings = warnings + 1;
            }

            return [
                '',
                chalk.dim(`${message.line}:${message.column}`),
                messageType,
                chalk.dim(message.linter || ''),
                message.reason.replace(/\.$/, ''),
            ];
        });
        tableLayout = table(styledOutput, tableOptions);
        format = tableLayout.split('\n');
        format = `${format.join('\n')}\n\n`;
        fileOutput += `${filename}\n`;
        fileOutput += format;
        output += fileOutput;
    });

    if (total > 0) {
        const _bold = [
            '\u2716 ',
            total,
            pluralize(' problem', total),
            ' (',
            errors,
            pluralize(' error', errors),
            ', ',
            warnings,
            pluralize(' warning', warnings),
            ')\n',
        ];

        if (errors > 0) {
            summaryColor = 'red';
        }

        output += chalk[summaryColor].bold(_bold.join(''));
    }

    return {
        message: total > 0 ? output : '',
        warnings,
        errors,
    };
};

const lint = (source, options, webpack) => {
    const messages = [];
    let lintOptions = defaultOptions;
    let done = false;
    let content = fs.readFileSync(options.resourcePath, 'utf8');

    if (isFile(options.config)) {
        lintOptions = assign(lintOptions, fs.readJsonSync(options.config));
    }

    content = cleanContent(content);

    htmllint(content, lintOptions).then((issues) => {
        for (const issue of issues) {
            messages.push({
                line: issue.line,
                column: issue.column,
                length: 0,
                severity: severity[issue.rule],
                reason: htmllint.messages.renderIssue(issue),
                linter: issue.rule,
            });
        }

        done = true;
    }, (err) => {
        messages.push({
            line: 0,
            column: 0,
            length: 0,
            severity: 'warning',
            reason: err.message,
            linter: 'unknown',
        });

        done = true;
    });

    deasync.loopWhile(() => !done);

    if (messages.length > 0) {
        const formatted = stylish([{
            filePath: options.resourcePath,
            messages,
        }]);

        if (formatted.errors > 0) {
            if (options.failOnError) {
                throw new Error(`Module failed because of a htmllint error.\n ${formatted.message}`);
            } else {
                webpack.emitError(formatted.message);
            }
        } else if (formatted.warnings > 0) {
            if (options.failOnWarning) {
                throw new Error(`Module failed because of a htmllint warning.\n ${formatted.message}`);
            } else {
                webpack.emitWarning(formatted.message);
            }
        }
    }
};

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

