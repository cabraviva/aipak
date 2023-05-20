import chalk from 'chalk'
import { createSpinner } from 'nanospinner'
import puppeteer from 'puppeteer'
import { sleep } from '../utils.js'
import { tmpdir } from 'os'
import { join, extname } from 'path'
import { createWriteStream } from 'fs'
import axios from 'axios'
import { v4 } from 'uuid'
import { exec } from 'child_process'

const DEBUG = false

async function downloadFile(url: string, path: string, progress: Function): Promise<void> {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
    });

    const totalSize: number = parseInt(response.headers['content-length']);
    let downloadedSize: number = 0;

    response.data.on('data', (chunk: Buffer) => {
        downloadedSize += chunk.length;
        const progressPercentage: number = (downloadedSize / totalSize) * 100;
        if (progress) {
            progress(progressPercentage);
        }
    });

    const writer = createWriteStream(path);
    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
        writer.on('finish', () => {
            resolve();
        });

        writer.on('error', (err: unknown) => {
            reject(err);
        });
    });
}

const runExecutable = (filePath: string) => {
    return new Promise((resolve, reject) => {
        exec(`"${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

export default async function command(args: string[]) {
    const programName = args.join(' ').trim()
    if (programName === '') {
        console.log(chalk.red(`Error: Please provide a program name!`))
        process.exit(1)
    }

    const lookingUpSpinner = createSpinner(`Looking up program ${chalk.cyan(programName)}`).start()

    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(programName + ' download')}`

    const browser = await puppeteer.launch({
        headless: DEBUG ? false : 'new',
        slowMo: DEBUG ? 1500 : 0
    })
    const page = await browser.newPage()

    await page.goto(googleUrl)

    const hrefs = await page.evaluate(() => {
        const results = [...document.querySelectorAll('.g')].slice(0, 5).map(e => e.querySelector('a')?.href)
        return results
    })

    let href = ''
    let hrefI = 0
    let hrefFound = false
    let mwsFound = 0
    while (!hrefFound) {
        const currentHref = hrefs[hrefI]
        if (!currentHref) throw new Error('Did not find href!')

        // Scan for virus
        const vtPage = await browser.newPage()
        await vtPage.goto(`https://www.virustotal.com/gui/search/${encodeURIComponent(encodeURIComponent(currentHref))}`)

        await sleep(1000)

        const isMalware = await vtPage.evaluate(() => {
            // @ts-ignore
            return parseInt(document.querySelector('url-view').shadowRoot.querySelector('#report').shadowRoot.querySelector('vt-ui-detections-widget').shadowRoot.querySelector('.positives').innerText.trim()) !== 0
        })

        // @ts-ignore
        if (!isMalware) {
            hrefFound = true
            href = currentHref
        } else {
            mwsFound += 1
        }


        await vtPage.close()

        hrefI += 1
    }

    lookingUpSpinner.success()
    if (mwsFound !== 0) {
        console.log(chalk.yellow(`Ignored ${mwsFound} urls that are possibly malware`))
    }
    console.log(chalk.gray(`Looking for download on url: ${href}`))

    await page.goto(href)

    const analyzingDlLinkSpinner = createSpinner('Analyzing download links').start()

    await page.waitForNetworkIdle()
    const dlLink = await page.evaluate(() => {
        return [...document.querySelectorAll('a[href]')].filter(l => {
            // @ts-ignore
            const a = l.href || ''
            return !(a.includes('twitter') || a.includes('youtu') || a.includes('login') || a.includes('instagram') || a.includes('linkedin') || a.includes('facebook'))
            // @ts-ignore
        }).map(a => { return { href: a.href, text: a.innerText } }).filter(({ href }) => href.endsWith('.exe') || href.endsWith('.msi'))[0]
    })

    if (!dlLink || !dlLink.href) {
        console.log(chalk.red(`\nError: Wasn't able find download link!`))
        process.exit(1)
    }

    await browser.close()

    analyzingDlLinkSpinner.success()
    console.log(chalk.gray(`Downloading from url: ${dlLink.href}`))

    console.clear()

    const dlSpinner = createSpinner('Downloading').start()

    const pth = join(tmpdir(), `${v4()}${extname(dlLink.href)}`)

    await downloadFile(dlLink.href, pth, (x: number) => {
        dlSpinner.update({
            text: `Downloading: ${Math.round(x)}%`
        })
    })

    dlSpinner.success()

    console.clear()

    console.log(chalk.green(`Successfully downloaded ${programName}. Installer should open automatically`))

    try {
        await runExecutable(pth)
    } catch {
        console.log(chalk.red('Seems like the installer didn\'t execute sucessfully. Maybe you should try to install the program manually.'))
    }
}