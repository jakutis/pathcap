var trim = require('trim');
var fs = require('fs');
module.exports = function(dir, filename, isDirectory, maxFilenameBytes, cb) {
    var filenameBuffer = new Buffer(filename);
    var i = filename.lastIndexOf('.');
    var suffix = new Buffer(0);
    if(i >= 0 && !isDirectory) {
        suffix = new Buffer(filename.substr(i));
    }
    if(suffix.length >= maxFilenameBytes) {
        cb(new Error('Suffix byte count is greater than given max filename byte count'));
        return;
    }
    if(filenameBuffer.length > maxFilenameBytes) {
        var bytes = maxFilenameBytes - suffix.length;

        var b = filenameBuffer[bytes];
        while((b & ((1 << 7) | (1 << 6))) === (1 << 7)) {
            bytes -= 1;
            b = filenameBuffer[bytes];
        }

        var newFilename = trim(filenameBuffer.slice(0, bytes).toString()) + suffix.toString();
        fs.rename(dir + '/' + filename, dir + '/' + newFilename, function(err) {
            if(err) {
                cb(err);
                return;
            }
            cb(null, newFilename);
        });
    } else {
        cb(null, filename);
    }
};
