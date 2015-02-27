// Basic Gulp File
//
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefix = require('gulp-autoprefixer'),
    notify = require("gulp-notify"),
    bower = require('gulp-bower'),
    minifyCSS = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify');

var config = {
    resPath: './resources',
    pubPath: './public',
    bowerDir: './bower_components'
}

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});

gulp.task('icons', function() {
    return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*')
        .pipe(gulp.dest('./public/fonts'));
});

gulp.task('glyphicons', function() {
    return gulp.src(config.bowerDir + '/bootstrap-sass-official/assets/fonts/bootstrap/**.*')
        .pipe(gulp.dest('./public/fonts'));
});

gulp.task('fonts', function() {
	return gulp.src(config.resPath + '/fonts/**.*')
		.pipe(gulp.dest('./public/fonts'));
});

gulp.task('fontawesomecss', function() {
    return gulp.src(config.bowerDir + '/fontawesome/css/**.*')
        .pipe(gulp.dest('./public/css'));
});

gulp.task('fontawesome', function() {
    return sass(config.bowerDir + '/fontawesome/scss/font-awesome.scss')
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(sourcemaps.init())
        .pipe(autoprefix('last 2 version'))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('css', function() {
    return sass(config.resPath + '/sass/style.scss', { loadPath : config.bowerDir + '/bootstrap-sass-official/assets/stylesheets' })
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(sourcemaps.init())
        .pipe(autoprefix('last 2 version'))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'))
        .pipe(livereload());
});

gulp.task('compress', function() {
	return gulp.src(config.resPath + '/js/app.js')
		.pipe(uglify({preserveComments:"some"}))
		.pipe(gulp.dest('./public/js'))
});

gulp.task('js', ['compress'],function() {
    return gulp.src([
            config.bowerDir + '/jquery/dist/jquery.min.js',
            config.bowerDir + '/bootstrap-sass-official/assets/javascripts/bootstrap.min.js',
            config.bowerDir + '/smooth-scroll/dist/js/smooth-scroll.min.js',
            config.pubPath + '/js/app.js',
            config.resPath + '/js/ie10-viewport-bug-workaround.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/js'))
        .pipe(livereload());
});

gulp.task('html', function() {
    return gulp.src(config.resPath + '/index.html')
        .pipe(gulp.dest('./public'))
        .pipe(livereload());
});

gulp.task('contact', function() {
    return gulp.src(config.resPath + '/contact.php')
        .pipe(gulp.dest('./public'))
        .pipe(livereload());
});

gulp.task('favicon', function() {
    return gulp.src(config.resPath + '/favicon.ico')
        .pipe(gulp.dest('./public'))
        .pipe(livereload());
});

gulp.task('img', function() {
    return gulp.src(config.resPath + '/img/**.*')
        .pipe(gulp.dest('./public/img'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(config.resPath + '/sass/**/*.scss', ['css']);
    gulp.watch(config.resPath + '/js/app.js', ['compress']);
    gulp.watch(config.pubPath + '/js/app.js', ['js']);
    gulp.watch(config.resPath + '/index.html', ['html']);
    gulp.watch(config.resPath + '/contact.php', ['contact']);
});

gulp.task('default', ['bower', 'icons', 'fontawesome', 'glyphicons', 'fonts', 'compress', 'js', 'html', 'contact', 'favicon', 'img']);
