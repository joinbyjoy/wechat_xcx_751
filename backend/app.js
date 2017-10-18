var path = require('path'),
    logger = require('morgan'),
    express = require('express'),
    favicon = require('serve-favicon'),
    bodyParser = require('body-parser');

global.RootPath = __dirname;

var app = express()
    .set('view engine', 'ejs')
    .set('views', path.join(__dirname, 'views'));

with(app) {
    disable('x-powered-by');
    locals.appConfig = {
        name: process.env.npm_package_name,
        version: process.env.npm_package_version,
        author: process.env.npm_package_author_name,
        homepage: process.env.npm_package_homepage
    };

    if (get('env') === 'production') {
        use(logger('combined'));
    } else {
        use(logger('dev')).use(function (req, res, next) {
            res._headers = { 'x-powered-by': locals.appConfig.author };
            next();
        });
        locals.pretty = true;
    }
}

app.use(express.static(path.join(__dirname, 'public')))
    // uncomment after placing your favicon in /public
    // .use(favicon(path.join(__dirname, 'public', 'favicon.ico'), { maxAge: 864e5 * 180 }))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))

    .use('/api751', require('./routes/api751'))
    .use('/beta', require('./routes/beta'))

    // catch 404 and forward to error handler
    .use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    })
    .use(function (err, req, res, next) {
        // render the error page
        res.status(err.status || 500);
        res.render('error', {
            message: err.status + ' - ' + err.message,
            error: app.get('env') === 'development' ? err : {}
        });
    });

module.exports = app;