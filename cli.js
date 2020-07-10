#!/usr/bin/env node

const puppeteer = require('puppeteer')

require('yargs')
    .scriptName('correios-scrapper')
    .usage('$0 <cmd> [args]')
    .command('find [object_code]', 'Find object shipping information', (yargs) => {
        yargs.positional(
            'object_code', {
            type: 'string',
            describe: 'The object you want to track'
        });
    }, function (argv) {
        if(!argv.object_code.match('[A-Z]{2}[0-9]{9}[A-Z]{2}')){
            console.log('Please enter a valid brazilian object code format');
        } else {
            var object_code = argv.object_code;
            console.log(`Searching for code: ${object_code}`);
            (async () => {
                console.log('Launching puppeteer...');
                const browser = await puppeteer.launch({headless: false});
                const page = await browser.newPage();
                console.log('Heading to Correios page...');
                await page.goto('https://www2.correios.com.br/sistemas/rastreamento/default.cfm');
                console.log('Filling track code...');
                await page.type('#objetos', object_code, {delay: 100});
                console.log('Sending information...');
                await page.$eval('#sroForm', form => form.submit());
                console.log('Gathering information...');
                await page.waitForNavigation({waitUntil: 'domcontentloaded'});
                const lastUpdate = await page.$eval('.sroLbEvent', text => text.innerText);
                if(lastUpdate.split('\n').length >= 2){
                    console.log(`Last Update Status: ${lastUpdate.split('\n')[0]}`);
                    console.log(`Last Update Details: ${lastUpdate.split('\n')[1]}`);
                } else {
                    console.log(`Last Update Status: ${lastUpdate}`);
                }
                const location = await page.$eval('.sroDtEvent', text => text.innerText);
                console.log(`Last Update Location: ${location.split('\n')[2]}`);
                console.log(`Updated at: ${location.split('\n')[0]} ${location.split('\n')[1]}`);
                console.log('Closing browser...');
                await browser.close();
            })();
        }
    })
    .help()
    .argv