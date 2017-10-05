const assign = require('object-assign');
const chalk = require('chalk');
const deasync = require('deasync');
const fs = require('fs');
const htmllint = require('htmllint');
const stripAnsi = require('strip-ansi');
const table = require('text-table');

const htmlAttributes = require('./html-attributes');
const severities = require('./html-severities');

const getRandomInt = (min, max) => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);

  return Math.floor(Math.random() * (maxFloor - minCeil)) + minCeil;
};

const randomKey = key => `${key}-${getRandomInt(1, 10000)}`;

const matchReplace = match => {
  let output = match;

  while (output.search(/{{{.*?}}}/) >= 0) {
    output = output.replace(/{{{.*?}}}/, randomKey('handlebars'));
  }

  while (output.search(/{{.*?}}/) >= 0) {
    output = output.replace(/{{.*?}}/, randomKey('handlebars'));
  }

  while (output.search(/<%=.*?%>/) >= 0) {
    output = output.replace(/<%=.*?%>/, randomKey('handlebars'));
  }

  while (output.search(/<%-.*?%>/) >= 0) {
    output = output.replace(/<%-.*?%>/, randomKey('handlebars'));
  }

  while (output.search(/<%.*?%>/) >= 0) {
    output = output.replace(/<%.*?%>/, randomKey('handlebars'));
  }

  while (output.search(/<\?php.*?\?>/) >= 0) {
    output = output.replace(/<\?php.*?\?>/, randomKey('php'));
  }

  while (output.search(/<\?=.*?\?>/) >= 0) {
    output = output.replace(/<\?=.*?\?>/, randomKey('php'));
  }

  while (output.search(/<\?.*?\?>/) >= 0) {
    output = output.replace(/<\?.*?\?>/, randomKey('php'));
  }

  return output;
};

const cleanAttributes = content => {
  let output = content;

  for (const key in htmlAttributes) {
    if (Object.prototype.hasOwnProperty.call(htmlAttributes, key)) {
      const attr = htmlAttributes[key];

      // if the content has the attribute within it then go ahead and clean it for handlebars and php
      if (output.indexOf(attr) > -1) {
        // regex to catch attributes with quotes
        const regex = new RegExp(`${attr}=".*?"`, 'g');

        // every valid html attr that is not quoted
        const hbsRegex = new RegExp(`${attr}={{{.*?}}}`);
        const hbsRegex2 = new RegExp(`${attr}={{.*?}}`);
        const ejsRegex = new RegExp(`${attr}=<%=.*?%>`);
        const ejsRegex2 = new RegExp(`${attr}=<%-.*?%>`);
        const ejsRegex3 = new RegExp(`${attr}=<%.*?%>`);
        const phpRegex = new RegExp(`${attr}=<\\?php.*?\\?>`);
        const phpRegex2 = new RegExp(`${attr}=<\\?=.*?\\?>`);
        const phpRegex3 = new RegExp(`${attr}=<\\?.*?\\?>`);

        output = output.replace(regex, matchReplace);
        output = output.replace(hbsRegex, `${attr}=${randomKey('handlebars')}`);
        output = output.replace(hbsRegex2, `${attr}=${randomKey('handlebars')}`);
        output = output.replace(ejsRegex, `${attr}=${randomKey('ejs')}`);
        output = output.replace(ejsRegex2, `${attr}=${randomKey('ejs')}`);
        output = output.replace(ejsRegex3, `${attr}=${randomKey('ejs')}`);
        output = output.replace(phpRegex, `${attr}=${randomKey('php')}`);
        output = output.replace(phpRegex2, `${attr}=${randomKey('php')}`);
        output = output.replace(phpRegex3, `${attr}=${randomKey('php')}`);
      }
    }
  }

  return output;
};

const cleanHandlebars = content => {
  let output = content;

  // clean multiple intances of handlebars text in 1 line
  while (output.search(/{{{.*?}}}/) >= 0) {
    output = output.replace(/{{{.*?}}}/, '');
  }

  // clean multiple intances of handlebars text in 1 line
  while (output.search(/{{.*?}}/) >= 0) {
    output = output.replace(/{{.*?}}/, '');
  }

  return output;
};

const cleanEjs = content => {
  let output = content;

  // clean multiple intances of EJS escaped text in 1 line
  while (output.search(/<%=.*?%>/) >= 0) {
    output = output.replace(/<%=.*?%>/, '');
  }

  // clean multiple intances of EJS unescaped text in 1 line
  while (output.search(/<%-.*?%>/) >= 0) {
    output = output.replace(/<%-.*?%>/, '');
  }

  // clean multiple intances of EJS all other text in 1 line
  while (output.search(/<%.*?%>/) >= 0) {
    output = output.replace(/<%.*?%>/, '');
  }

  return output;
};

const cleanPHP = content => {
  let output = content;

  // clean multiple intances of php tag text in 1 line
  while (output.search(/<\?php.*?\?>/) >= 0) {
    output = output.replace(/<\?php.*?\?>/, '');
  }

  // clean multiple intances of php short tag text in 1 line
  while (output.search(/<\?=.*?\?>/) >= 0) {
    output = output.replace(/<\?=.*?\?>/, '');
  }

  // clean multiple intances of php shortest tag text in 1 line
  while (output.search(/<\?.*?\?>/) >= 0) {
    output = output.replace(/<\?.*?\?>/, '');
  }

  return output;
};

const cleanContent = content => {
  const lines = content.split('\n');
  let disabled = false;

  /* eslint-disable no-div-regex */
  for (let [i, line] of lines.entries()) { // eslint-disable-line prefer-const
    if (line.indexOf('{{!htmllint:disable}}') > -1) {
      disabled = true;
    }

    if (line.indexOf('{{!htmllint:enable}}') > -1) {
      disabled = false;
    }

    if (disabled || line.indexOf('{{!htmllint:disable-line}}') > -1) {
      line = '';
    } else {
      line = cleanAttributes(line);
      line = cleanHandlebars(line);
      line = cleanEjs(line);
      line = cleanPHP(line);
      line = line
        .replace(/="\s\s\s/, '="')
        .replace(/="\s\s/, '="')
        .replace(/="\s/, '="')
        .replace(/\s\s\s"/, '"')
        .replace(/\s\s"/, '"')
        .replace(/\s"/, '"')
        .replace(/<>/, '')
        .replace(/<\/>/, '')
        .replace('<?php', '')
        .replace('<?=', '')
        .replace('<?', '')
        .replace('<%', '')
        .replace('%>', '')
        .replace('?>', '');
    }
    /* eslint-enable no-div-regex */

    lines[i] = line;
  }

  return lines.join('\n');
};

const pluralize = (_word, count) => {
  let word = _word;

  if (count > 1) {
    word = `${word}s`;
  }

  return word;
};

const stylish = results => {
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

  results.forEach(file => {
    messages = file.messages;
    filename = chalk.underline(file.filePath);
    tableOptions = {
      align: ['', '  ', 'r', 'l'],
      stringLength: function stringLength(str) {
        return stripAnsi(str).length;
      },
    };

    fileOutput = '\n';

    if (messages.length === 0) {
      return;
    }

    total = total + messages.length;
    styledOutput = messages.map(message => {
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
    fileOutput = `${fileOutput}${filename}\n`;
    fileOutput = fileOutput + format;
    output = output + fileOutput;
  });

  if (total > 0) {
    const bold = [
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

    output = output + chalk[summaryColor].bold(bold.join(''));
  }

  const message = total > 0 ? new Error(output) : '';
  delete message.stack;
  return {
    message,
    warnings,
    errors,
  };
};

const lint = (source, options, webpack) => {
  const messages = [];
  let done = false;
  let content = fs.readFileSync(options.resourcePath, 'utf8'); // eslint-disable-line no-sync

  // take care of fragmented title tags
  content = content.replace(/<title>[\s\S]*?<\/title>/, match => {
    const parts = match.split('\n');
    const last = parts.length - 1;

    if (last === 0) {
      return '<title>has title</title>';
    }

    for (const [i, part] of parts.entries()) { // eslint-disable-line no-unused-vars
      if (i === 0) {
        parts[i] = '<title>';
      } else if (i === last) {
        parts[i] = '</title>';
      } else {
        parts[i] = `${i}`;
      }
    }

    return parts.join('\n');
  });

  content = cleanContent(content);

  // fragmented handlebars
  while (content.search(/{{{[\s\S]*?}}}/) >= 0) {
    content = content.replace(/{{{[\s\S]*?}}}/, match => '\n'.repeat(match.split('\n').length - 1));
  }

  // fragmented handlebars
  while (content.search(/{{[\s\S]*?}}/) >= 0) {
    content = content.replace(/{{[\s\S]*?}}/, match => '\n'.repeat(match.split('\n').length - 1));
  }

  htmllint(content, options.lintOptions).then(issues => {
    for (const issue of issues) {
      let rule = '';

      switch (issue.code) {
      case 'E018':
        rule = 'tag-self-close';
        break;
      case 'E025':
        rule = 'html-req-lang';
        break;
      default:
        rule = severities[issue.rule] || 'unknown';
      }

      messages.push({
        line: issue.line,
        column: issue.column,
        length: 0,
        severity: severities[rule],
        reason: htmllint.messages.renderIssue(issue),
        linter: rule,
      });
    }

    done = true;
  }, err => {
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
    // formatted.message is returned from stylish();
    const formatted = stylish([{
      filePath: options.resourcePath,
      messages,
    }]);

    if (formatted.errors > 0) {
      if (options.failOnError) {
        webpack.emitError(formatted.message);

        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Module failed because of a htmllint errors.\n ${formatted.message}`);
        }
      } else {
        webpack.emitWarning(formatted.message);
      }
    } else if (formatted.warnings > 0) {
      if (options.failOnWarning) {
        webpack.emitError(formatted.message);

        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Module failed because of a htmllint warnings.\n ${formatted.message}`);
        }
      } else {
        webpack.emitWarning(formatted.message);
      }
    }
  }
};

module.exports = function htmlLint(source) {
  const cwd = process.cwd();
  const options = assign(
    {
      config: 'node_modules/htmllint-loader/.htmllintrc',
      failOnError: true,
      failWarning: false,
    },
    this.query
  );

  options.lintOptions = JSON.parse(fs.readFileSync(options.config)); // eslint-disable-line no-sync

  if (this.resourcePath.indexOf(cwd) === 0) {
    options.resourcePath = this.resourcePath.substr(cwd.length + 1);
  }

  lint(source, options, this);

  return source;
};

