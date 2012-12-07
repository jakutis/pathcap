var optimist = require('optimist');
var fs = require('fs');
var api = require('./api');

var version = JSON.parse(fs.readFileSync(__dirname + '/../package.json')).version;
var opts = optimist
    .boolean('version')
    ['default']('version', false)
    .describe('version', 'Display version of Pathcap')
;
var argv = opts.argv;

if(argv.version) {
    console.log('Pathcap v' + version);
    return;
}

opts = opts
    .usage('Pathcap v' + version + '\n\nRecursively rename directories and files to have names no longer than given number of bytes\n\nUsage: $0')
    .boolean('h')
    ['default']('h', false)
    .alias('h', 'help')
    .describe('h', 'Display this help text')
    .string('m')
    .demand('m')
    .alias('m', 'max')
    .describe('m', 'Max filename byte length (e.g. 255 for ext2, ext3, ext4 filesystems)')
    .string('d')
    .demand('d')
    .alias('d', 'dir')
    .describe('d', 'Root directory to walk')
;
argv = opts.argv;

if(argv.help) {
    opts.help();
    return;
}

var maxFilenameBytes = parseInt(argv.max, 10);
if(maxFilenameBytes < 1 || isNaN(maxFilenameBytes)) {
    console.error('Max filename bytes must be greater than zero');
    process.exit(1);
    return;
}

if(typeof argv.dir !== 'string' || argv.dir === '') {
    console.error('Root directory is empty');
    process.exit(1);
    return;
}

fs.stat(argv.dir, function(err, stat) {
    if(err) {
        console.error('Root directory "' + argv.dir + '" does not exist');
        process.exit(1);
        return;
    }
    if(!stat.isDirectory()) {
        console.error('Root directory "' + argv.dir + '" is actually not a directory');
        process.exit(1);
        return;
    }
    api(argv.dir, maxFilenameBytes, function(err) {
        if(err) {
            console.error(err);
            process.exit(1);
        }
    });
});
