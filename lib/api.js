var fs = require('fs');
var renameIfNeeded = require('./renameIfNeeded');
var a = require('async');

var noop = function() {};

module.exports = function(dir, maxFilenameBytes, cb) {
    var total = 0;
    var dirs = [dir];
    var loop = function(cb) {
        var dir = dirs.shift();
        fs.readdir(dir, function(err, files) {
            if(err) {
                cb(err);
                return;
            }
            a.forEach(files, function(filename, cb) {
                fs.stat(dir + '/' + filename, function(err, stats) {
                    if(err) {
                        cb(err);
                        return;
                    }
                    renameIfNeeded(dir, filename, stats.isDirectory(), maxFilenameBytes, function(err, newFilename) {
                        if(err) {
                            cb(err);
                            return;
                        }
                        if(filename !== newFilename) {
                            console.log('Renamed', '"' + dir + '/' + filename + '"', 'to', '"' + dir + '/' + newFilename + '"');
                            total += 1;
                        }
                        if(stats.isDirectory()) {
                            dirs.push(dir + '/' + newFilename);
                        }
                        cb(null);
                    });
                });
            }, cb);
        });
    };
    var handle = function(err) {
        if(err) {
            cb(err);
            return;
        }
        if(dirs.length > 0) {
            loop(handle);
        } else {
            console.log('Renamed items:', total);
            cb(null);
        }
    };
    loop(handle);
};
