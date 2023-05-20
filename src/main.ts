#! /usr/bin/env node
import chalk from 'chalk'
import fs from 'fs-extra'
import { join, dirname } from 'path'
import { platform } from 'os'
const { version } = fs.readJSONSync(join(platform() === 'win32' ? dirname(import.meta.url).substring(7).substring(1) : dirname(import.meta.url).substring(7), '..', 'package.json'))
import helpCommand from './commands/help.js'
import installCommand from './commands/install.js'
import updateCommand from './commands/update.js'

const args = process.argv.slice(2)
const command = args[0]
const argsSliced = args.slice(1)

if (!command || command.includes('help')) {
    // Show help menu
    console.log(chalk.cyan(`AIPak v${version}`))
    helpCommand(argsSliced)
    process.exit(0)
}

if (command === 'install' || command === 'i') {
    installCommand(argsSliced)
} else if (command === 'update') {
    updateCommand(argsSliced)
} else {
    console.log(chalk.red(`Error: Unknown command ${command}`))
    process.exit(1)
}