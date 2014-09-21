Gulp-Bower-Starter
==================

Gulp, Bower, Bootstrap Sass, FontAwesome Starter

Based on Eric Barnes tutorial [Setting up Gulp, Bower, Bootstrap Sass, & FontAwesome](http://ericlbarnes.com/setting-gulp-bower-bootstrap-sass-fontawesome/)

```
mkdir testproject && cs testproject
bower init
bower install bootstrap-sass-official --save
bower install fontawesome --save
cat > package.json
{}
^C
cat package.json
npm install gulp gulp-ruby-sass gulp-notify gulp-autoprefixer gulp-bower --save-dev

#create gulpfile.js and edit, see gulpfile.js
```