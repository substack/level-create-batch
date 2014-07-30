var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var create = require('level-create');
var batch = require('../');

test('invalid batch type', function (t) {
    t.plan(1);
    
    var rows = [
        { key: 'substack', value: { bio: 'beep boop' } },
        { key: 'xyz', value: 123, type: 'del' }
    ];
    
    batch(db, rows, function (err) {
        t.equal(err.code, 'BATCH TYPE');
    });
});
