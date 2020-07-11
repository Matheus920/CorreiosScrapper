const puppeteer = require('puppeteer')
const fs = require('fs')
const inquirer = require('inquirer')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
})

var command = {}

command.find = function (argv) {
    if (!argv.object_code || !argv.object_code.match('[A-Z]{2}[0-9]{9}[A-Z]{2}')) {
        console.log('Please enter a valid brazilian object code format');
        process.exit(1);
    } else {
        var object_code = argv.object_code;
        console.log(`Searching for code: ${object_code}`);
        (async () => {
            console.log('Launching puppeteer...');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox',
                    '--proxy-server="direct://"',
                    '--proxy-bypass-list=*',
                    '--disable-setuid-sandbox',
                    '--disable-infobars',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"']
            });
            const page = await browser.newPage();
            console.log('Heading to Correios page...');
            await page.goto('https://www2.correios.com.br/sistemas/rastreamento/');
            console.log('Filling track code...');
            await page.type('#objetos', object_code, { delay: 100 });
            console.log('Sending information...');
            await page.$eval('#sroForm', form => form.submit());
            console.log('Gathering information...');
            try {
                await page.waitForSelector('.sroLbEvent', { timeout: 10000 });
            }
            catch (e) {
                console.log('No information for the provided code. Try again later!');
                process.exit(1);
            }
            const lastUpdate = await page.$eval('.sroLbEvent', text => text.innerText);
            if (lastUpdate.split('\n').length >= 2) {
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
}

command.save = function (argv) {
    let items = []
    if (!argv.object_code || !argv.object_code.match('[A-Z]{2}[0-9]{9}[A-Z]{2}')) {
        console.log('Please enter a valid brazilian object code format');
        process.exit(1);
    } else {
        readline.question('Enter a name for this code (max 23 characters)', answer => {
            if (answer && answer.length <= 23) {
                answer = answer.trim()

                try {
                    if (fs.existsSync('favorites.json')) {
                        try {
                            items = JSON.parse(fs.readFileSync('favorites.json'));

                            if ((items.filter(favorite => favorite.value == argv.object_code)).length > 0) {
                                console.log('Code already registered.');
                                process.exit(1);
                            }

                            if ((items.filter(favorite => favorite.name == answer)).length > 0) {
                                console.log('Name already registered for another code.');
                                process.exit(1);
                            }
                        } catch (e) {
                            console.log('Error when reading the file.');
                            process.exit(1);
                        }
                    }
                } catch (e) {
                    console.log('Couldnt find wether the file exists or not. Try again later!');
                    process.exit(1);
                }

                items.push({
                    value: argv.object_code,
                    name: answer
                });

                json = JSON.stringify(items);

                try {
                    fs.writeFileSync('favorites.json', json);
                    console.log('Favorite saved successfully!');
                    process.exit(0);
                } catch (e) {
                    console.log('Something wrong when writing the file. Try again later!');
                    process.exit(1);
                }

            } else {
                console.log('Invalid name!');
                process.exit(1);
            }
        })
    }
}

command.clear = function (argv) {
    try {
        if(fs.existsSync('favorites.json')) {
            try {
                fs.unlinkSync('favorites.json');
                console.log('File sucessfully deleted.');
                process.exit(0);
            } catch (e) {
                console.log('Couldnt delete file.');
                process.exit(1);
            }
        }
    } catch (e) {
        console.log('Couldnt check whether file exists or not.');
        process.exit(1);
    }
}

command.findFavorite = function (argv) {
    try {
        console.log('Reading favorites file...');
        items = JSON.parse(fs.readFileSync('favorites.json'));
        inquirer.prompt([
            {
                type: 'list',
                name: 'favorites',
                message: 'Which object do you want to track?',
                choices: items
            }
        ]).then(answers => {
           this.find({object_code: answers.favorites}) 
        });

    } catch (e) {
        console.log('Something went wrong when reading favorites file.');
        process.exit(1);
    }
}

command.clearFavorite = function (argv) {
    console.log('Reading favorites file...');
    try {
        let items = JSON.parse(fs.readFileSync('favorites.json'));
        inquirer.prompt([
            {
                type: "checkbox",
                name: "favorites",
                message: 'Which objects do you want to clear?',
                choices: items
            }
        ]).then(answers => {   
            if(answers.favorites.length > 0){
                (answers.favorites).forEach(element => {
                    items = items.filter(item => item.value != element);
                });

                console.log('Deleting choices...')

                isEmpty = items.length == 0;

                items = JSON.stringify(items);

                try {
                    if(!isEmpty){
                        fs.writeFileSync('favorites.json', items);
                    } else {
                        fs.unlinkSync('favorites.json')
                    }
                    console.log('Sucessfully deleted!');
                    process.exit(0);
                } catch (e) {
                    console.log('Something went when deleting favorites.');
                    process.exit(1);
                }
            } else {
                console.log('At least one must be selected.');
                process.exit(1);
            }
        })
    } catch (e) {
        console.log('Something went wrong when reading favorites file.');
        process.exit(1);
    }
}

module.exports = command