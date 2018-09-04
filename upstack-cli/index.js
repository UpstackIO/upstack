#!/usr/bin/env node

/*const chalk = require('chalk')
const figlet = require('figlet')

console.log(
  chalk.blue(
    figlet.textSync('upstack', {horizontalLayout: 'full'})
  )
);*/

const {exec, spawn} = require('child_process')
const path = require('path')
const fs = require('fs')
const commander = require('commander')

commander
  .version(require('./package').version)
  .usage('<command> [options]')

commander
  .command('link <packagePath>')
  .option('-f, --force', 'Create symbolic links forcefully.')
  .option('-d, --dev-dependency', 'Add as devDependency')
  .action((packagePath, cmd) => {
    validateUpstackProject()
    let pkgAbsPath = path.resolve(packagePath)
    if (!fs.existsSync(pkgAbsPath + '/package.json')) {
      throw new Error(`Invalid package in path: ${pkgAbsPath}/package.json`)
    }

    const pkgName = require(pkgAbsPath + '/package').name
    if (!pkgName) {
      throw new Error('No package name found.')
    }

    exec(`cd ${pkgAbsPath} && yarn link && cd ${process.cwd()} && yarn link ${pkgName}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
    });

    let packageInfo = JSON.parse(fs.readFileSync(process.cwd() + '/package.json'))
    packageInfo.dependencies = packageInfo.dependencies || {}
    packageInfo.dependencies[require(pkgAbsPath + '/package.json').name] = require(pkgAbsPath + '/package.json').version;
    fs.writeFileSync(process.cwd() + '/package.json', JSON.stringify(packageInfo))
  })

commander.parse(process.argv)

function validateUpstackProject() {
  if (!require(`${process.cwd()}/package`).upstack) {
    throw new Error('This is not an upstack project')
  }
}
