import chalk from 'chalk'
import { createSpinner } from 'nanospinner'

export default async function command(args: string[]) {
    const programName = args.join(' ').trim()
    if (programName === '') {
        console.log(chalk.red(`Error: Please provide a program name!`))
        process.exit(1)
    }

    const lookingUpSpinner = createSpinner(`Looking up program ${chalk.cyan(programName)}`).start()

    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(programName + ' download')}`
    


    lookingUpSpinner.success()
}