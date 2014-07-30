var level = require('level');
var db = level('/tmp/users.db', { valueEncoding: 'json' });
var batch = require('../');

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    alias: { u: 'user', p: 'pass', b: 'bio' }
});

var crypto = require('crypto');
var shasum = require('shasum');

var salt = crypto.randomBytes(32);
var hash = shasum(Buffer.concat([ salt, Buffer(argv.pass) ]));

var rows = [
    {
        key: 'users!' + argv.user,
        value: { bio: argv.bio }
    },
    {
        key: 'login!' + argv.user,
        value: { salt: salt, hash: hash }
    }
];

batch(db, rows, function (err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});
