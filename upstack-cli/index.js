#!/usr/bin/env node

/*const chalk = require('chalk')
const figlet = require('figlet')

console.log(
  chalk.blue(
    figlet.textSync('upstack', {horizontalLayout: 'full'})
  )
);*/


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

    if (!require(pkgAbsPath + '/package').name) {
      throw new Error('No package name found.')
    }

    let modules_dirs = [
      `${process.cwd()}/linked_modules`,
      `${process.cwd()}/node_modules`
    ]
    modules_dirs.forEach((dir) => {
      mkdirSyncRecursive(dir)
      let link = `${dir}/${path.basename(pkgAbsPath)}`
      try {
        if (cmd.force) {
          if (fs.readlinkSync(link)) {
            fs.unlinkSync(link)
          } else if (fs.existsSync(link)) {
            fs.rmdirSync(link)
          }
        }
      } catch (e) {
        console.log(e)
      }
      fs.symlinkSync(pkgAbsPath, link)
    })
    
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

function mkdirSyncRecursive(directory) {
  let path = directory.replace(/\/$/, '').split('/');

  for (let i = 1; i <= path.length; i++) {
    let segment = path.slice(0, i).join('/');
    segment.trim() && !fs.existsSync(segment) ? fs.mkdirSync(segment) : null;
  }
}