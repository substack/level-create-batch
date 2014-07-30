var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var create = require('level-create');
var batch = require('../');

test('useradd locked batch array', function (t) {
    t.plan(2);
    
    var rows = [
        { key: 'substack', value: { bio: 'beep boop' } },
        { key: 'xyz', value: 123 }
    ];
    
    create(db, 'substack', { bio: 'wot' }, function (err) {
        t.ifError(err);
    });
    
    batch(db, rows, function (err) {
        t.equal(err.code, 'LOCKED');
    });
});
