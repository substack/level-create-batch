var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var create = require('level-create');
var batch = require('../');

test('put', function (t) {
    t.plan(1);
    
    create(db, 'index', 1000, function (err) {
        var rows = [
            { key: 'substack', value: { bio: 'beep boop' } },
            { key: 'index', value: 2000, type: 'put' }
        ];
        batch(db, rows, function (err) {
            t.ifError(err, "put rows don't matter");
        });
    });
});
