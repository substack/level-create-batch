var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var batch = require('../');

db.get = function (key, cb) {
    process.nextTick(function () {
        var err = new Error('blah');
        err.code = 'ENOBLAH';
        cb(err);
    });
};

test('database error', function (t) {
    t.plan(1);
    
    var rows = [
        { key: 'substack', value: { bio: 'beep boop' } },
        { key: 'index', value: 3000 }
    ];
    batch(db, rows, function (err) {
        t.equal(err.code, 'ENOBLAH');
    });
});
