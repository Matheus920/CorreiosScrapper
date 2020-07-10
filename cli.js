#!/usr/bin/env node

const command = require('./commands')

require('yargs')
    .scriptName('correios-scrapper')
    .usage('$0 <cmd> [args]')
    .command('f [object_code]', 'Find object shipping information', (yargs) => {
        yargs.positional(
            'object_code', {
            type: 'string',
            describe: 'The object you want to track'
        });
    }, function (argv) {
        command.find(argv)
    })
    .command('sf [object_code]', 'Save an object code as favorite for lather accesss',
        (yargs) => {
            yargs.positional(
                'object_code', {
                type: 'string',
                describe: 'The object you want to save'
            });
        }, function (argv) {
            command.save(argv)
        })
    .command('cf', 'Clear all favorites', function(argv) {
        command.clear(argv)
    })
    .command('ff', 'Find tracking information for a favorite code', function(argv) {
        command.findFavorite(argv)
    })
    .demandCommand()
    .help()
    .argv