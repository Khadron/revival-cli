const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const download = require('download-git-repo');
const ora = require('ora');
const {
    prompt
} = require('inquirer');
const {
    resolve
} = require('path');

const questions = [{
        type: 'input',
        name: 'project',
        message: 'Project name:',
        validate(val) {
            if (val !== '') {
                return true
            }
            return 'Project name is required!'
        }
    },
    {
        type: 'input',
        name: 'template',
        message: 'Template name: (defalut)',
        validate(val) {

            if (val !== '') {
                if (tplInfo[val]) {
                    return true
                } else if (!tplInfo[val]) {
                    return 'This template doesn\'t exists.'
                }
            }

            return true;
        }
    }
];

// let project = "aa",
//     template = "kk"
// const tplInfo = require(path.resolve(__dirname, "../templates.json"));
// const message = "New project has been initialized successfully!";
// let dist = path.join(process.cwd(), project);
// let defalut = Object.keys(tplInfo).length == 0;
// const spinner = ora(defalut ? "The project is being initialized..." : "Downloading template...");
// spinner.start();

// if (defalut) {
//     let tplPath = path.resolve(__dirname, "../templates");
//     copyDir(tplPath, dist, function(err) {
//         spinner.stop();
//         if (err) {
//             console.log(chalk.red(err));
//             process.exit();
//         }

//         console.log(chalk.green(message));
//     });
// } else {
//     let gitAddr = tplInfo[template]["cloneAddr"],
//         gitBranch = tplInfo[template]["branch"];
//     download(`${gitAddr}#${gitBranch}`, dist, (err) => {
//         spinner.stop();
//         if (err) {
//             console.log(chalk.red(err));
//             process.exit();
//         }
//         console.log(chalk.green(message));
//     });
// }

module.exports = prompt(questions).then(({ project, template }) => {

    const tplInfo = require(path.resolve(__dirname, "../templates.json"));
    const message = "New project has been initialized successfully!";
    let dist = path.join(process.cwd(), project);
    let defalut = Object.keys(tplInfo).length == 0;
    const spinner = ora(defalut ? "The project is being initialized..." : "Downloading template...");
    spinner.start();

    if (defalut) {
        let tplPath = path.resolve(__dirname, "../templates");
        copyDir(tplPath, dist, function(err) {
            spinner.stop();
            if (err) {
                console.log(chalk.red(err));
                process.exit();
            }

            console.log(chalk.green(message));
        });
    } else {
        let gitAddr = tplInfo[template]["cloneAddr"],
            gitBranch = tplInfo[template]["branch"];
        download(`${gitAddr}#${gitBranch}`, dist, (err) => {
            spinner.stop();
            if (err) {
                console.log(chalk.red(err));
                process.exit();
            }
            console.log(chalk.green(message));
        });
    }
});

function copyDir(src, dist, callback) {

    try {

        _copy(src, dist);
        callback(null);
    } catch (err) {

        callback(err);
    }

    function _copy(src, dist) {

        try {
            fs.accessSync(dist);
        } catch (err) {
            fs.mkdirSync(dist);
        }
        var paths = fs.readdirSync(src);
        paths.forEach(function(p) {
            var _src = path.join(src, p);
            var _dist = path.join(dist, p);
            // console.log(_dist);

            var statInfo = fs.statSync(_src);
            // 判断是文件还是目录
            if (statInfo.isFile()) {
                fs.writeFileSync(_dist, fs.readFileSync(_src));
            } else if (statInfo.isDirectory()) {
                // 当是目录是，递归复制
                _copy(_src, _dist);
            }
        });

    }

    // fs.access(dist, function (err) {
    //     if (err) {
    //         // 目录不存在时创建目录
    //         fs.mkdirSync(dist);
    //     }
    //     _copy(null, src, dist);
    // });

    // function _copy(err, src, dist) {
    //     if (err) {
    //         callback(err);
    //     } else {
    //         fs.readdir(src, function (err, paths) {
    //             if (err) {
    //                 callback(err);
    //             } else {

    //                 try {

    //                     paths.forEach(function (p) {
    //                         var _src = path.join(src, p);
    //                         var _dist = path.join(dist, p);
    //                         console.log(_dist);

    //                         var statInfo = fs.statSync(_src);
    //                         // 判断是文件还是目录
    //                         if (stat.isFile()) {
    //                             fs.writeFileSync(_dist, fs.readFileSync(_src));
    //                         } else if (stat.isDirectory()) {
    //                             // 当是目录是，递归复制
    //                             copyDir(_src, _dist, callback)
    //                         }
    //                     });
    //                 } catch (err) {
    //                     callback(err);
    //                 }
    //                 callback(null);
    //             }
    //         });
    //     }
    // }
}