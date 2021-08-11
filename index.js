#! /usr/bin/env node

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const rootCommand = process.argv[2];
const commandOptions =process.argv.slice(3);

const CLASP_FILENAME = '.clasp.json';
const MULTICLASP_FILENAME = '.multi-clasp.json';
const UTF_8 = 'utf8';
const argv = require('minimist')(process.argv.slice(2));

/**
 * Push a Clasp configuration
 *
 * @param {object} clasp the single clasp config
 * @return true if ok, false otherwise
 */
async function pushClasp(clasp) {
    await fs.writeFile(CLASP_FILENAME, JSON.stringify(clasp, null, 2) , UTF_8, async (err) => {
        if (err) throw err;
    });
    console.log('Pushing scriptId:', clasp.scriptId);

    try {
        const { stdout, stderr } = await exec('clasp push');
        console.log('stdout:', stdout);
    } catch (e) {
        console.error(e); // should contain code (exit code) and signal (that caused the termination).
        return false;
    }

    return true;
}

const clasps = JSON.parse(fs.readFileSync(MULTICLASP_FILENAME, UTF_8));
({
  async push(commandOptions) {
      for (let i = 0, len = clasps.length; i < len; i++) {
          let retVal=false;
          for (let r = 1; r <= (argv.retry || 1); r++) {
              retVal=await pushClasp(clasps[i]);
              if (retVal) break;
          }
          if(!retVal) return false;
      }

      fs.unlink(CLASP_FILENAME, (err) => {
          if (err) throw err;
      });
  },
})[rootCommand](commandOptions);
