import chalk from 'chalk'

export default function command (args: string[]) {
    console.log(chalk.gray('If you want to learn more about AIPak: https://github.com/greencoder001/aipak/'))
    console.log(chalk.cyan('\nCommands:'))
    console.log(chalk.cyan(`install <program name> ${chalk.gray('Installs a program')}`))
    console.log(chalk.cyan(`reinstall ${chalk.gray('Reinstalls all installed programs')}`))
    console.log(chalk.cyan(`update ${chalk.gray('Updates aipak')}`))
}