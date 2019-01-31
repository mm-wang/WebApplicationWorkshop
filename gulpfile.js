const gulp = require("gulp");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const eslint = require("gulp-eslint");
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const notify = require('gulp-notify');

// const minify = require("gulp-minify");
// const stripJsComments = require("gulp-strip-comments");
// const removeEmptyLines = require("gulp-remove-empty-lines");
// const stripCssComments = require("gulp-strip-css-comments");
// const insert = require("gulp-insert");
// const stripDebug = require('gulp-strip-debug');
// const rename = require("gulp-rename");

const rollup = require("rollup");
const vueplugin = require('rollup-plugin-vue');
// const commonjs = require('rollup-plugin-commonjs');
const cleanup = require('rollup-plugin-cleanup');
const babel = require('rollup-plugin-babel');

let esLintRules = {
    "eqeqeq": 0,
    "no-use-before-define": 0
};

let esLintJs ={
    parser: "babel-eslint",
    rules: esLintRules,
    globals: [
        "$"
    ]
};

let paths = {
    browser: ["./browser/**/*.js"],
    sass: ["./browser/**/*.scss"],
    server: ["./server/**/*.js"]
}

let rollupOpts = {
    es6Folder: "browser/es6/**/*.js",
    entry: "./browser/es6/main.js",
    output: {
        format: "umd",
        name: "main",
        file: "./public/main.js",
        indent: "  "
    },
    plugins: [
        babel({
            exclude: 'node_modules/**',
            "presets": [
                ["@babel/preset-env"]
            ]
        }),
        vueplugin(),
        cleanup()
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
        .pipe(gulp.dest("./public"))
}

function prepJsBrowserSrc() {
    return gulp.src(paths.browser)
        .pipe(sourcemaps.init())
        .pipe(concat("main.js"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./public"))
}

function prepJsRollup() {
    return gulp.src(rollupOpts.es6Folder)
        .pipe(concat("es6_bundle.js"))
        .pipe(gulp.dest("./public"))
}

async function jsRollup() {
    const bundle = await rollup.rollup({
        input: rollupOpts.entry,
        plugins: rollupOpts.plugins
    });
    // await bundle.write(rollupOpts.output);
    await bundle.generate({
        format: "umd",
        name: "myBundle"
    });
}

function runRollup(done) {
    jsRollup().then((output) => {
        console.log("output of rollup? ", rollup);
        done();
    });
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
const build = gulp.parallel(gulp.series(lintServerJs, lintBrowserJs, prepJsBrowserSrc, prepJsRollup, runRollup), prepSass);
build.description = "Lint javascript and concat, while also running sass";

const watchSass = () => gulp.watch(paths.sass, gulp.series(prepSass, reload))
watchSass.description = "Watch the sass sources, reload";
const watchBrowserJs = () => gulp.watch(paths.browser, gulp.series(lintBrowserJs, prepJsBrowserSrc, reload))
watchBrowserJs.description = "Watch the javascript sources, reload";

const buildWatch = gulp.series(build, gulp.parallel(watchBrowserJs, watchSass));
buildWatch.description = "Default task: building and watching series";

const buildRollup = gulp.series(prepJsRollup, runRollup);

module.exports = {
    default: buildWatch,
    watchSass: watchSass,
    watchBrowserJs: watchBrowserJs,
    rollup: buildRollup,
    build: build
};
