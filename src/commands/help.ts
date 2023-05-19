import { strnum, Arguments } from '../types.ts'
import chalk from 'npm:chalk'

export default function command (args: Arguments, argsSliced: strnum[]) {
    console.log(chalk.gray('If you want to learn more about AIPak: https://github.com/greencoder001/aipak/'))
}