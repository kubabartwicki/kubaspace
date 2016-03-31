var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	watch = require('gulp-watch');

gulp.task('default', function() {
	return gulp.src('style.css')
		.pipe(watch('style.css'))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dist'));
});