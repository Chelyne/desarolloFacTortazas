
const { src, dest} = require('gulp');
// const minifyJs = require('gulp-uglify');
const concat = require('gulp-concat');

const getInterfaces = () => {
    return src('./src/app/models/**/*.ts')
        //.pipe(minifyJs())
        //.pipe(minifyJs())
        .pipe(concat('interfaces.ts'))
        .pipe(dest('./dist/'));
}

exports.getInterfaces = getInterfaces;
