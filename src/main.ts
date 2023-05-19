import { parse } from 'https://deno.land/std@0.188.0/flags/mod.ts'
import chalk from 'npm:chalk'
import { version } from '../meta.ts'
import helpCommand from './commands/help.ts'

const args = parse(Deno.args)
const command = args._[0]
const argsSliced = args._.slice(1)

if (!command || args.help || args.h) {
    // Show help menu
    console.log(chalk.cyan(`AIPak v${version}`))
    helpCommand(args, argsSliced)
    Deno.exit(0)
}