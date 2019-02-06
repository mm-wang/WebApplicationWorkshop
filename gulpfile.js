const path = require("path");
const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const eslint = require("gulp-eslint");
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const notify = require('gulp-notify');
const minify = require("gulp-minify");

const rollup = require("rollup");
const vueplugin = require('rollup-plugin-vue');
const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');
const babel = require('rollup-plugin-babel');

let esLintRules = {
    "eqeqeq": 0,
    "no-use-before-define": 0
};

let esLintJs = {
    parser: "vue-eslint-parser",
    extends: [
        "plugin:vue/base"
    ],
    parserOptions: {
        parser: "babel-eslint",
        sourceType: "module"
    },
    rules: esLintRules,
    globals: [
        "$"
    ],
    plugins: [
        "vue"
    ]
};

let baseDir = path.join(process.cwd(), ".\/");
// console.log("base directory: ", baseDir);
let paths = {
    browser: [baseDir + "browser\/**\/*.js", baseDir + "browser\/**\/*.vue"],
    sass: [baseDir + "browser\/css\/*.scss"],
    server: [baseDir + "server\/**\/*.js"]
}

function changeSlashes() {
    Object.keys(paths).forEach(function(pathType) {
        paths[pathType].forEach(function(path) {
            console.log("path", path);
            path.replace(/\//g, "\\");
            console.log("post split", path);
        });
    });
    // console.log(paths);
}

if (process.platform === "win32") changeSlashes();


let rollupOpts = {
    es6Folder: baseDir + "browser\/es6\/**\/*.js",
    input: baseDir + "browser\/es6\/main.js",
    output: {
        format: "umd",
        name: "main",
        file: ".\/public\/main.js",
        indent: "  "
    },
    plugins: [
        commonjs({
            include: [
                'node_modules\/**'
            ]
        }),
        vueplugin(),
        cleanup(),
        babel({
            exclude: 'node_modules/**',
            presets: [
                ["@babel/preset-env", {
                    modules: false
                }]
            ],
            plugins: [
                '@babel/plugin-external-helpers'
            ],
            runtimeHelpers: true,
            externalHelpers: true
        })
    ],
    sourceMap: true
};

/*
 Browser Sync
 */

function reload(done) {
    browserSync.reload();
    done();
}

function serve(done) {
    browserSync.init({
        server: {
            baseDir: './'
        },
        open: false
    });
    done();
}


/*
 Tasks
 */
function prepSass() {
    return gulp.src(paths.sass)
        .pipe(sass())
        .pipe(concat("style.css"))
        .pipe(gulp.dest(".\/public"))
}

function prepJsBrowserSrc() {
    return gulp.src(paths.browser)
        .pipe(sourcemaps.init())
        .pipe(concat("main.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(".\/public"));
}

async function jsRollup() {
    const bundle = await rollup.rollup({
        input: rollupOpts.input,
        plugins: rollupOpts.plugins
    });
    let generated = await bundle.generate(rollupOpts.output);
    let written = await bundle.write(rollupOpts.output);
    return written;
}

function lintBrowserJs() {
    function onError(err) {
        notify.onError({
            message: "Linting failed on browser, check gulp! Error: <%= error.message %>",
        })(err);
        this.emit('end');
    };

    return gulp.src(paths.browser)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(eslint(esLintJs))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
}

function lintServerJs() {
    function onError(err) {
        notify.onError({
            message: "Linting failed on server, check gulp! Error: <%= error.message %>",
        })(err);
        this.emit('end');
    };

    return gulp.src(paths.server)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(eslint(esLintJs))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
}

/*
 Sequences
 */
const build = gulp.parallel(gulp.series(lintServerJs, lintBrowserJs, prepJsBrowserSrc, jsRollup), prepSass);
build.description = "Lint javascript and concat, while also running sass";

const watchSass = () => gulp.watch(paths.sass, gulp.series(prepSass, reload))
watchSass.description = "Watch the sass sources, reload";
const watchBrowserJs = () => gulp.watch(paths.browser, gulp.series(lintBrowserJs, prepJsBrowserSrc, jsRollup, reload))
watchBrowserJs.description = "Watch the javascript sources, reload";

const buildWatch = gulp.series(build, gulp.parallel(watchBrowserJs, watchSass));
buildWatch.description = "Default task: building and watching series";

const buildRollup = gulp.series(jsRollup);

module.exports = {
    default: buildWatch,
    watchSass: watchSass,
    watchBrowserJs: watchBrowserJs,
    rollup: buildRollup,
    build: build
};
