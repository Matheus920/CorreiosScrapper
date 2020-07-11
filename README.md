# Correios Scrapper
A Node.js Puppeteer web scraper for brazilian delivery packages information. This module is a CLI that aims to make the tracking of brazilian shipping easier.

## Instalation
To use this module in your machine, you'll need npm avaliable. Download the module by typing:

```npm i -g correios-scrapper```

To verify if the installation succeded, type:

```correios-scrapper --version``` 

In your CMD, and you should see the installed version.

## Usage
Correios Scrapper provide a useful help command to let you look through all the other commands and possible arguments. Basically, you can find an object last update status, save an object code as favorite and manage your favorites.

Too see specifics about those commands, type:

```correios-scrapper --help```

## Known Issues
It appears to exist an issue with the own Correios site if too many requests are made in sequence, probably a DDOS protection. If you experience timeouts regularly when using the CLI, please wait an hour and everything should return to normal.

## Contribution
This project is open to contributions, just create an issue in this Github page and i will try to answer you as soon as possible.