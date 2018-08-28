#!/usr/bin/env node

/*const chalk = require('chalk')
const figlet = require('figlet')

console.log(
  chalk.blue(
    figlet.textSync('upstack', {horizontalLayout: 'full'})
  )
);*/

const commander = require('commander')

commander
  .version(require('./package').version)
  .usage('<command> [options]')

commander
  .option('--no-sauce', 'Remove sauce')
  .parse(process.argv);

console.log(`you ordered a pizza ${commander.sauce ? 'with' : 'without'} sauce`);