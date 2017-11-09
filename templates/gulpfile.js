const fs = require("fs");
const combiner = require("stream-combiner2");
const browserSync = require("browser-sync").create(),
    gulp = require("gulp"),
    runSequence = require("gulp-sequence").use(gulp),
    autoprefixer = require("gulp-autoprefixer"), //自动添加css3前缀
    minifycss = require("gulp-clean-css"), //压缩css
    jshint = require("gulp-jshint"), //js代码校验
    uglify = require("gulp-uglify"), //压缩JS
    imagemin = require("gulp-imagemin"), //压缩图片
    rename = require("gulp-rename"), //重命名文件
    concat = require("gulp-concat"), //文件合并
    notify = require("gulp-notify"), //提示信息
    cache = require("gulp-cache"),
    clean = require("gulp-clean"),
    htmlmin = require("gulp-htmlmin"), //压缩html代码
    rev = require("gulp-rev-append"), //添加时间戳
    cmdPack = require("gulp-cmd-pack"); //cmd模块打包

let config = require("./gulpconfig");
let reload = browserSync.reload;

function existsSync(path) {
    try {
        fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        return false;
    }

    return true;
}

function combined(array) {
    var combined = combiner.obj(array);
    combined.on("error", console.error.bind(console));
    return combined;
}

/** ======PRE====== **/
gulp.task('clean', function(cb) {
    return combined([
        gulp.src(config.path.dist, { read: false }),
        clean()
    ]);
});

gulp.task("createDir", () => {
    try {
        let dirs = config.dirs;
        for (let i in dirs) {
            var path = dirs[i];
            if (!existsSync()) {
                fs.mkdirSync(path);
                console.log("mkdir -> " + path);
            }
        }
    } catch (err) {
        throw err;
    }
});

/** ======BUILD====== **/

//- css
gulp.task("precss", () => {

    //css预处理 SASS、LESS
    return combined([]);
});
gulp.task("css", ["precss"], () => {
    return combined([
        gulp.src(`${config.path.src}/css/**/*.css`),
        autoprefixer(),
        concat("main.css"),
        minifycss({ compatibility: "ie7" }),
        gulp.dest(`${config.path.dist}/css`)
    ]);
});

//- scripts
gulp.task("seajs:prod", () => {
    return combined([
        gulp.src(`${config.path.src}/js/libs/sea.js`),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

gulp.task("appjs:prod", ["seajs:prod"], () => {
    //入口文件打包
    return combined([
        gulp.src(`${config.path.src}/js/app.js`),
        cmdPack({
            mainId: "app", //初始化模块的id 
            base: `${config.path.src}/js`, //base路径 
            alias: {
                'utils': 'utils.js',
                "main": "main.js"
            },
            ignore: ["main"] //这里的模块将不会打包进去 
        }),
        concat("app.js"),
        uglify({
            ie8: true,
            mangle: {
                reserved: [
                    'require',
                    'exports',
                    'module',
                    '$',
                    'doT'
                ]
            }
        }),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

gulp.task("vendorjs:prod", ["appjs:prod"], () => {

    //vendor文件打包
    return combined([
        gulp.src([
            `${config.path.src}/js/libs/doT.min.js`,
            `${config.path.src}/js/libs/jquery.min.js`
        ]),
        concat("vendor.js"),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

gulp.task("js", ["vendorjs:prod"], () => {
    return combined([
        gulp.src(`${config.path.src}/js/main.js`),
        cmdPack({
            mainId: "main", //初始化模块的id 
            base: `${config.path.src}/js`, //base路径 
            alias: {

            },
            ignore: [] //这里的模块将不会打包进去 
        }),
        concat("main.js"),
        uglify({
            ie8: true,
            mangle: {
                reserved: [
                    'require',
                    'exports',
                    'module',
                    '$',
                    'doT'
                ]
            }
        }),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

//- html
gulp.task("prehtml:prod", () => {
    return combined([
        gulp.src(`${config.path.src}/**/*.html`),
        htmlmin({
            removeComments: true, //清除HTML注释
            collapseWhitespace: true, //压缩HTML
            removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
            minifyJS: true, //压缩页面JS
            minifyCSS: true //压缩页面CSS
        }),
        gulp.dest(`${config.path.dist}`)
    ]);
});
gulp.task("html", ["prehtml:prod"], () => {
    return combined([
        gulp.src(`${config.path.dist}/**/*.html`),
        rev(),
        gulp.dest(`${config.path.dist}`)
    ]);
});

//- images
gulp.task("img", () => {
    return combined([
        gulp.src(config.path.src + "/images/**/*.{png,jpg,gif,ico,svg}"),
        cache(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ], { verbose: false })),
        gulp.dest(`${config.path.dist}/images`)
    ]);
});

/** ======DEV====== **/
//- css
gulp.task("precss:dev", () => {

    //css预处理 SASS、LESS
    return combined([]);
});
gulp.task("css:dev", ["precss:dev"], () => {
    return combined([
        gulp.src(`${config.path.src}/css/**/*.css`),
        autoprefixer(),
        concat("main.css"),
        gulp.dest(`${config.path.dist}/css`)
    ]);
});

//- scripts
gulp.task("seajs:dev", () => {
    return combined([
        gulp.src(`${config.path.src}/js/libs/sea.js`),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

gulp.task("appjs:dev", ["seajs:dev"], () => {
    return combined([
        gulp.src(`${config.path.src}/js/app.js`),
        cmdPack({
            mainId: "app", //初始化模块的id 
            base: `${config.path.src}/js`, //base路径 
            alias: {
                'utils': 'utils.js',
                "main": "main.js"
            },
            ignore: ["main"] //这里的模块将不会打包进去 
        }),
        concat("app.js"),
        jshint(),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

gulp.task("vendorjs:dev", ["appjs:dev"], () => {
    return combined([
        gulp.src([]),
        concat("vendor.js"),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

gulp.task("js:dev", ["robotjs:dev"], () => {
    return combined([
        gulp.src(`${config.path.src}/js/main.js`),
        cmdPack({
            mainId: "main", //初始化模块的id 
            base: `${config.path.src}/js`, //base路径 
            alias: {},
            ignore: [] //这里的模块将不会打包进去 
        }),
        concat("main.js"),
        jshint(),
        gulp.dest(`${config.path.dist}/js`)
    ]);
});

//- html
gulp.task("prevhtml:dev", () => {
    return combined([
        gulp.src(`${config.path.src}/**/*.html`),
        gulp.dest(`${config.path.dist}`)
    ]);
});
gulp.task("html:dev", ["prevhtml:dev"], () => {
    return combined([
        gulp.src(`${config.path.dist}/**/*.html`),
        rev(),
        gulp.dest(`${config.path.dist}`)
    ]);
});


//- images
gulp.task("img:dev", () => {
    return combined([
        gulp.src(config.path.src + "/images/**/*.{png,jpg,gif,ico,svg}"),
        gulp.dest(`${config.path.dist}/images`)
    ]);
});

/** server **/
gulp.task("server", () => {
    browserSync.init({
        port: 3666,
        server: {
            baseDir: "./dist"
        },
        notify: false
    });

    gulp.watch(`${config.path.src}/js/**/*.js`, ["js:dev"]);
    gulp.watch(`${config.path.src}/css/**/*.css`, ["css:dev"]);
    gulp.watch(`${config.path.src}/**/*.html`, ["html:dev"]);
    gulp.watch(`${config.path.dist}/**/*.*`).on("change", reload);
});

/** ======zip====== **/
gulp.task("zip", () => {
    const zip = require("gulp-zip");
    let curDate = new Date();
    let prodName = `prod-${curDate.getFullYear()}-${curDate.getMonth()+1}-${curDate.getDate()}.zip`
    return combined([
        gulp.src(`${config.path.dist}/**/*.*`),
        zip(prodName),
        gulp.dest(`${config.path.dist}/`),
        notify("complete the package ……")
    ]);
});

/** ======UPLOAD====== **/
gulp.task("upload", () => {
    const sftp = require("gulp-sftp");
    return combined([
        gulp.src(`${config.path.dist}/*.zip`),
        sftp({
            host: config.sftp.host,
            user: config.sftp.user,
            port: config.sftp.port,
            key: config.sftp.key,
            pass: config.sftp.pass,
            remotePath: config.sftp.remotePath
        }),
        notify("being uploading ……")
    ]);
});

gulp.task("upload:dev", () => {
    const sftp = require("gulp-sftp");
    return combined([
        gulp.src(`${config.path.dist}/**/*.*`),
        sftp({
            host: config.sftp.host,
            user: config.sftp.user,
            port: config.sftp.port,
            key: config.sftp.key,
            pass: config.sftp.pass,
            remotePath: config.sftp.remotePath
        })
    ]);
});

/** ======TEST====== **/
gulp.task("test", (cb, dd) => {

});

/** ======PROXY====== **/
gulp.task("hot", ["upload:dev"], function() {
    reload();
});
gulp.task("proxy", () => {
    browserSync.init({
        port: 3666,
        proxy: {
            target: `${config.proxy.host}:${config.proxy.port}${config.proxy.path}`,
            reqHeaders: config.proxy.header
        },
        notify: false
    });

    gulp.watch(`${config.path.src}/js/**/*.js`, ["js:dev"]);
    gulp.watch(`${config.path.src}/js//images/**/*.{png,jpg,gif,ico,svg}`, ["img:dev"]);
    // gulp.watch(`${config.path.src}/css/**/*.less`, ["css:dev"]);
    gulp.watch(`${config.path.src}/css/**/*.css`, ["css:dev"]);
    gulp.watch(`${config.path.src}/**/*.html`, ["html:dev"]);
    gulp.watch(`${config.path.dist}/**/*.*`, ["hot"]);
});

/** ======DEPLOY======= **/
gulp.task("deploy", function() {
    return combined([
        gulp.src(`${config.path.dist}/**/*.*`),
        gulp.dest(config.path.deploy)
    ]);
});

/** ======RUN====== **/
gulp.task("build", (cb) => {
    runSequence("clean", "createDir", ["css", "js", "img"], "html", "deploy")(cb);
});

gulp.task("build:dev", (cb) => {
    runSequence("clean", "createDir", ["css:dev", "img:dev", "js:dev"], "html:dev", "deploy")(cb);
});

gulp.task("publish", ["build"], (cb) => {
    runSequence("zip", "upload")(cb);
});

gulp.task("dev:local", (cb) => {
    runSequence("clean", "createDir", ["css:dev", "img:dev", "js:dev"], "html:dev", "server")(cb);
});

gulp.task("dev:remote", (cb) => {
    runSequence("clean", "createDir", ["css:dev", "img:dev", "js:dev"], "html:dev", "upload:dev", "proxy")(cb);
});

//压缩doT.js使支持ie8
gulp.task("dot", () => {
    return combined([
        gulp.src(`${config.path.src}/js/libs/doT.min.js`),
        uglify({
            ie8: true,
            mangle: {
                reserved: [
                    'require',
                    'exports',
                    'module',
                    '$',
                    'doT'
                ]
            }
        }),
        gulp.dest(`${config.path.src}/js/libs`)
    ]);
});