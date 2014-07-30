var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var create = require('level-create');
var batch = require('../');

test('falsy', function (t) {
    t.plan(1);
    
    var rows = [
        undefined,
        { key: 'substack', value: { bio: 'beep boop' } },
        null,
        { key: 'index', value: 3000 },
        false
    ];
    batch(db, rows, function (err) {
        t.ifError(err);
    });
});
