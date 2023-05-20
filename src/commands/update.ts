import chalk from 'chalk'
import { execSync } from 'child_process'
export default async function (args: string[]) {
    execSync('npm i -g aipak')
    console.log(chalk.green('Updated AIPak!'))
}