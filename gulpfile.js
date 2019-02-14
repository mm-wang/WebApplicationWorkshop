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
const resolve = require('rollup-plugin-node-resolve');
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
		"vue",
	]
};

let paths = {
	browser: ["./browser/**/*.js", "./browser/es6/**/*.js", "./browser/es6/**/**/*.js", "./browser/**/*.vue", "./browser/es6/**/*.vue"],
	sass: ["./browser/css/*.scss"],
	server: ["./server/**/*.js"],
	public: ["./public"],
	rollupFolder: "./browser/es6/**/*.js",
	rollupInput: "./browser/es6/main.js",
	rollupOutput: "./public/main.js",
	rollupNodeModules: ['./node_modules/**']
}

//plugins: https://github.com/storybooks/storybook/issues/1320#issuecomment-310777396

let rollupOpts = {
	es6Folder: paths.rollupFolder,
	input: paths.rollupInput,
	output: {
		format: "umd",
		name: "main",
		file: paths.rollupOutput,
		indent: "  ",
		sourceMap: "inline"
	},
	plugins: [
		resolve({
			module: true,
			browser: true
		}),
		commonjs({
			include: paths.rollupNodeModules
		}),
		cleanup(),
		vueplugin(),
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
	return gulp.src(paths.sass, {
			cwd: process.cwd()
		})
		.pipe(sass())
		.pipe(concat("style.css"))
		.pipe(gulp.dest(paths.public[0]))
}

function prepJsBrowserSrc() {
	return gulp.src(paths.browser, {
			cwd: process.cwd()
		})
		.pipe(sourcemaps.init())
		.pipe(concat("main.js"))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.public[0]));
}

// function prepJsBrowserDepsSrc() {
// 	return gulp.src(paths.dependencies, {
// 			cwd: process.cwd()
// 		})
// 		.pipe(sourcemaps.init())
// 		.pipe(concat("dependencies.js"))
// 		.pipe(sourcemaps.write())
// 		.pipe(gulp.dest(paths.public[0]));
// }

// function prep3dm() {
// 	return gulp.src(paths.rhino, {
// 			cwd: process.cwd()
// 		})
// 		.pipe(gulp.dest(paths.public[0]+"/3dm"));
// }

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

	return gulp.src(paths.browser, {
			cwd: process.cwd()
		})
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

	return gulp.src(paths.server, {
			cwd: process.cwd()
		})
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
const build = gulp.parallel(gulp.series(lintServerJs, lintBrowserJs, prepJsBrowserSrc, jsRollup), prepSass /*, prep3dm*/ );
build.description = "Lint javascript and concat, while also running sass";

const watchSass = () => {
	return gulp.watch(paths.sass, gulp.series(prepSass, reload))
}
watchSass.description = "Watch the sass sources, reload";
const watchBrowserJs = () => {
	return gulp.watch(paths.browser, gulp.series(lintBrowserJs, prepJsBrowserSrc, jsRollup, reload))
}
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
