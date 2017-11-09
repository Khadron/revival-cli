const fs = require('fs');
const path = require('path');
const bower = require('bower');
const ora = require('ora');
const {
    prompt
} = require('inquirer');
const curWorkDir = process.cwd();

module.exports = (packs) => {

    const questions = [{
        type: 'input',
        name: 'place',
        message: 'Where the package is placed in the folder?',
        default: curWorkDir
    }];
    prompt(questions).then(({
        place
    }) => {

        let target = path.isAbsolute(place) ? path.join(place, "vender") : path.join(curWorkDir, place, "vender");
        const spinner = ora("Start installation……");
        spinner.start();
        bower.commands
            .install(packs, {
                save: true
            }, {
                directory: target
            })
            .on('error', function(error) {
                spinner.stop();
                console.log("No package found, please check the name of the package, error message:");
                console.log(`    ${error.message}`);

            })
            .on('end', function(installed) {
                spinner.stop();
                console.log("======= Complete ======");
                console.log(installed);
                console.log("======================");
            });
    }).catch((err) => {
        console.log(err);
    });
};