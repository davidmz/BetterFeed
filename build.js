var webpack = require("webpack");
var fs = require('fs');

var head = fs.readFileSync("./src/user-js-head.txt", "utf8");

webpack({
    entry: './src/js/main.js',
    output: {
        path: './build',
        filename: 'better-feed.min.js'
    },
    module: {
        loaders: [{test: /\.less$/, loader: 'style-loader!css-loader!less-loader'}]
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
