# Async extensions

Adds several utilities on top of [async.js](https://github.com/caolan/async). Aimed to be used as drop-in replacement:

```js
var async = require('asynx');
```


## Installation

```
npm install asynx
```


## Usage

### asynx.shift

```js
async.waterfall([
    // get response and body of an url
    async.apply(request.get, url),
    // throw away response and pass body to fs.writeFile
    async.shift,
    // write body to a file
    async.apply(fs.writeFile, filename)
], callback)
```


### asynx.if(test, then, else)

```js
function cachedGet(url, callback) {
    var filename = __dirname + '/cache/' + url.replace(/\//g, '#');

    async.if(
        async.apply(fs.exists, filename),
        async.apply(fs.readFile, filename),
        async.apply(async.waterfall, [
            async.apply(request, url),
            function (response, body, callback) {
                fs.writeFile(filename, body, function (error) {
                    callback(error, body);
                });
            }
        ]),
        callback
    )
}
```


### asynx.manual(states, callback)

```js
function cachedGet(url, callback) {
    var filename = __dirname + '/cache/' + url.replace(/\//g, '#');

    async.manual({
        // always starts from 'start' state
        start: function (next) {
            fs.exists(filename, function (exists) {
                // go to some new state
                if (exists) next.readCache()
                else next.request();
            });
        },
        request: function (next) {
            // use state transition as callback
            request(url, next.writeCache);
        },
        readCache: function (next) {
            // use next.end to leave state machine
            fs.readFile(filename, 'utf-8', next.end);
        },
        writeCache: function (response, body, next) {
            fs.writeFile(filename, body, 'utf-8', function (error) {
                next.end(error, body);
            });
        }
    }, callback);
}
```
