const gulp = require ('gulp');
const { task, src, dest } = gulp;
const path = require("path");
const plumber = require('gulp-plumber');
const map = require("map-stream");
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');

const dir = {
    dev: 'task-unl/src',
    pbl: 'public',
    bld: 'build',
    base: 'http://localhost:3000'
};

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

task('compileHtml', () => {
    const htmlmin = require('gulp-htmlmin');
    const fileinclude = require('gulp-file-include');
    return src([`${dir.dev}/pages/**/*.html`])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: `${dir.dev}/assets/templates`,
        }))
        // .pipe(replace(/<script.+script>/g, (htmlTag) => {
        //     return htmlTag.match(/<script.+index.js"><\/script>/) ? htmlTag : '';
        // }))
        // .pipe(replace(/<div class="gallery">(.|\n|\s)*?<\/div>/g, (gallery) => {
        //     const images = gallery.replace(/<img .+?>/g, '<figure class="thumb">$&</figure>');
        //     return images;
        // }))
        // .pipe(replace(/<img .+?>/g, (imgTag) => {
        //     const tag = imgTag.replace(/\.\.\//, '');
        //     // .replace(/\.jpg/, "-lg.jpeg");
        //     const regPath = /src=['"](.*?)['"]/;
        //     const regAlt = /alt=['"](.*?)['"]/;
        //     const regClass = /class=['"](.*?)['"]/;
        //     const src = tag.match(regPath)[1].toLowerCase();
        //     const srcSet = `
        //         ${src.slice(0, -4)}-sm.jpeg 300w,
        //         ${src.slice(0, -4)}-md.jpeg 600w,
        //         ${src.slice(0, -4)}-lg.jpeg 1200w,
        //         ${src.slice(0, -4)}-xlg.jpeg 1800w
        //     `;
        //     const sizes = `
        //         sizes="(max-width: 280px) 300px,
        //         (max-width: 580px) 600px,
        //         (max-width: 1180px) 1200px,
        //         1920px"
        //     `;
        //     const alt = tag.match(regAlt) ? tag.match(regAlt)[1] : 'dzerava';
        //     const classT = tag.match(regClass) ? tag.match(regClass)[1] : '';
        //     const tagN = `<img class="${classT}"
        //     srcset="${srcSet}"
        //     ${sizes}
        //     src="${src.slice(0, -4)}-sm.jpeg" alt="${alt}">`
        //     return tagN;
        // }))
        // .pipe(gulpif(isDev, htmlmin({ collapseWhitespace: true })))
        .pipe(dest(dir.pbl));
});

task('addFavicon', () => {
    return src(`${dir.dev}/**/dzerava.ico`)
        .pipe(map((file, cb) => {
            file.path = path.join(file.base, file.basename);
            cb(null, file);
        }))
        .pipe(dest(dir.pbl));
});

task('clean', () => {
    const del = require('del');
    return del(dir.pbl);
});

task('compileStyles', function() {
    const sass = require('gulp-sass');
    const postcss = require('gulp-postcss');
    const autoprefixer = require('autoprefixer');
    const cssnano = require('cssnano');
    return src([`${dir.dev}/**/*.css`, `${dir.dev}/**/*.scss`])
        .pipe(sourcemaps.init())
        .pipe(gulpif(file => file.extname === '.scss',
            sass({includePaths: require('node-normalize-scss').includePaths})))
        .pipe(concat('style.css'))
        .pipe(replace('./img', './images/services'))
        .pipe(postcss([
            autoprefixer({
                // grid: true,
            }),
            // cssnano()
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(dir.pbl));
});

task('compileScripts', () => {
    const babel = require('gulp-babel');
    // const webpackStream = require('webpack-stream');
    // const webpack = webpackStream.webpack;
    // const named = require('vinyl-named');
    const uglify = require('gulp-uglify');
    return src([`${dir.dev}/**/*.js`])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('index.js'))
        // .pipe(named())
        // .pipe(webpackStream(require('./webpack.config.js')))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(dir.pbl));
})

task('compileServImg', () => {
    return src(`${dir.dev}/assets/**/*.{png,svg,jpg,jpeg}`, {since: gulp.lastRun('compileServImg')})
    .pipe(map((file, cb) => {
        file.path = path.join(file.base, file.basename);
        cb(null, file);
    }))    
    .pipe(dest(`${dir.pbl}/images/services`))
})

task('compileProdImg', () => {
    const gm = require('gulp-gm');
    const imageResize = require('gulp-image-resize');
    const responsive = require('gulp-responsive');
    return src(`${dir.dev}/images/**/*.{png,PNG,jpg,JPG,jpeg,JPEG}`, {since: gulp.lastRun('compileProdImg')})
    // .pipe(map((file, cb) => {
    //     file.path = path.join(file.base.toLowerCase(), file.relative.toLowerCase());
    //     cb(null, file);
    // }))
    // // .on('data', (file) => console.log(file.path))
    // .pipe(responsive({
    //     '**/*.jpg': [{
    //         width: 200,
    //         rename: {
    //             suffix: '-sm',
    //             extname: '.jpg',
    //         },
    //       }, {
    //         width: 600,
    //         rename: {
    //             suffix: '-md',
    //             extname: '.jpg',
    //         },
    //       }, {
    //         width: 1200,
    //         rename: {
    //             suffix: '-lg',
    //             extname: '.jpg',
    //         },
    //       }, {
    //         width: 1800,
    //         rename: {
    //             suffix: '-xlg',
    //             extname: '.jpg',
    //         },
    //       }],
    //       // Resize all PNG images to be retina ready
    //     //   '**/*.png': [{
    //     //     width: 250,
    //     //   }, {
    //     //     width: 250 * 2,
    //     //     rename: { suffix: '@2x' },
    //     //   }],
    //     }, {
    //       // Global configuration for all images
    //       // The output quality for JPEG, WebP and TIFF output formats
    //       quality: 70,
    //       // Use progressive (interlace) scan for JPEG and PNG output
    //       progressive: true,
    //       // Strip all metadata
    //       withMetadata: true,
    //       withoutEnlargement: false,
    //     }
    // ))
    // .pipe(gulpif(file => file.stem.match(/-lg/),
    //     gm(function (gmfile, done) {
    //         gmfile.size(function (err, size) {
    //             done(null, gmfile
    //               // .draw(`image Over 100,100 100,100 ${dir.dev}/assets/images/dzerava_watermark.png`)
    //               .command('composite')
    //               .gravity('Center')
    //               .in(`${dir.dev}/assets/images/watermark-lg.png`)
    //             );
    //         });
    //     })
    // ))
    .pipe(dest(`${dir.pbl}/images`))
})

gulp.task('addFonts', () => {
    return gulp.src('src/assets/fonts/**/*.*', {since: gulp.lastRun('addFonts')})
        .pipe(gulp.dest(`${dir.pbl}/fonts`));
});

task('watch', () => {
    gulp.watch(`${dir.dev}/**/*.html`, gulp.series('compileHtml'));
    gulp.watch([`${dir.dev}/**/*.scss`, `${dir.dev}/**/*.css`], gulp.series('compileStyles'));
    gulp.watch(`${dir.dev}/assets/fonts/**/*.*`, gulp.series('addFonts'));
    gulp.watch([`${dir.dev}/**/*.js`, `${dir.dev}/**/*.jsx`], gulp.series('compileScripts'));
    gulp.watch(`${dir.dev}/assets/**/*.{png,svg,jpg,jpeg}`, gulp.series('compileServImg'));
    gulp.watch(`${dir.dev}/images/**/*.{png,PNG,jpg,JPG,jpeg,JPEG}`, gulp.series('compileProdImg'));
});

task('serve', () => {
    const browserSync = require('browser-sync').create();
    browserSync.init({
        server: dir.pbl,
    });
    browserSync.watch(`${dir.pbl}/**/*.*`).on('change', browserSync.reload);
});

// development bundle in 'public' directory command: gulp start
task('start', gulp.series(
    'compileHtml',
    'addFavicon',
    'compileStyles',
    'addFonts',
    'compileScripts',
    'compileServImg',
    'compileProdImg',
    gulp.parallel(
        'watch',
        'serve'
        )
    )
);

// production bundle in 'build' directory command: gulp dev
// gulp.task('build', gulp.series('compile-html-build'));
