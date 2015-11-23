var webpack = require("webpack");
var fs = require('fs');

var head = fs.readFileSync("./src/user-js-head.txt", "utf8");

webpack({
    entry: ['babel/polyfill', 'whatwg-fetch', './src/js/main.js'],
    output: {
        path: './build',
        filename: 'better-feed.min.js'
    },
    module: {
        loaders: [
            {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
            {test: /\.js$/, exclude: /(node_modules|bower_components)/, loader: 'babel'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({})//,
        //new webpack.ProvidePlugin({'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'})
    ]
}, function (err, stats) {
    if (err !== null) console.log(err);
    var jStats = stats.toJson();
    if (jStats.errors.length > 0) jStats.errors.forEach(function (m) { console.log("ERR", m); });
    if (jStats.warnings.length > 0) jStats.warnings.forEach(function (m) { console.log("WARN", m); });
});

webpack({
    entry: ['babel/polyfill', './src/js/options.js'],
    output: {
        path: './build',
        filename: 'options.min.js'
    },
    module: {
        loaders: [
            {test: /\.js$/, exclude: /(node_modules|bower_components)/, loader: 'babel'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({})
    ]
}, function (err, stats) { if (err !== null) console.log(err);});

webpack({
    entry: './src/bootstrap.js',
    output: {
        path: './build',
        filename: 'better-feed.user.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({}),
        new webpack.BannerPlugin(head, {raw: true})
    ]
}, function (err, stats) { if (err !== null) console.log(err);});

webpack({
    entry: './src/js/site-boot.js',
    output: {
        path: './build',
        filename: 'better-feed.site.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({})
    ]
}, function (err, stats) { if (err !== null) console.log(err);});
