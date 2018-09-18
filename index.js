#! /usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');

const rootCommand = process.argv[2];
const commandOptions =process.argv.slice(3);

const CLASP_FILENAME = '.clasp.json';
const MULTICLASP_FILENAME = '.multi-clasp.json';
const UTF_8 = 'utf8';

const clasps = JSON.parse(fs.readFileSync(MULTICLASP_FILENAME, UTF_8));
({
  push(commandOptions) {
    clasps.forEach(clasp => {
      fs.writeFile(CLASP_FILENAME, JSON.stringify(clasp, null, 2) , UTF_8);
      exec('clasp push', (error, stdout, stderr) => {
        if (error) {
          return console.log(stderr);
        }
        console.log(stdout);
      });

      fs.unlink(CLASP_FILENAME);
    });
  },
})[rootCommand](commandOptions);
