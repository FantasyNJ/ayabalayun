var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    babel = require('gulp-babel');
//语法检查
gulp.task('jshint', function () {
    return gulp.src('public/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
//移动所有非css js的文件
gulp.task('move', function(){
    return gulp.src(['public/**/*','!public/**/*.css','!public/**/*.js'])
        .pipe(gulp.dest('./dist'));
});
//压缩css
gulp.task('minifycss', function() {
    return gulp.src('public/**/*.css')    //需要操作的文件
        .pipe(rename({suffix: '.min'}))   //rename压缩后的文件名
        .pipe(minifycss())   //执行压缩
        .pipe(gulp.dest('./dist'));   //输出文件夹
});
//压缩，合并 js
gulp.task('minifyjs', function() {
    return gulp.src('public/**/*.js')      //需要操作的文件
        .pipe(babel({                      
            presets: ['es2015']
        }))                              
        .pipe(uglify())                 //压缩
        .pipe(rename({suffix: '.min'}))    //rename压缩后的文件名
        .pipe(gulp.dest('./dist'));          //输出
});
//默认命令，在cmd中输入gulp后，执行的就是这个任务(压缩js需要在检查js之后操作)
gulp.task('default', ['move'],function() {
    gulp.start('minifycss', 'minifyjs'); 
});