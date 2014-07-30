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
    
    batch(db, rows, function (err) {
        t.ifError(err);
    });
    
    create(db, 'substack', { bio: 'wot' }, function (err) {
        t.equal(err.code, 'LOCKED');
    });
});

test('useradd exists batch', function (t) {
    t.plan(6);
    
    var arows = [
        { key: 'a', value: 123 },
        { key: 'b', value: 555 }
    ];
    
    batch(db, arows, function (err) {
        t.ifError(err);
        var crows = [
            { key: 'a', value: 555 },
            { key: 'q', value: 333 }
        ];
        batch(db, crows, function (err) {
            t.equal(err.code, 'EXISTS');
            db.get('q', function (err) {
                t.equal(
                    err.type, 'NotFoundError',
                    'should not have created a key in an aborted batch'
                );
            });
            db.get('a', function (err, value) {
                t.equal(value, 123);
            });
        });
    });
    
    var brows = [
        { key: 'x', value: 444 },
        { key: 'xyz', value: 333 }
    ];
    
    batch(db, brows, function (err) {
        t.equal(err.code, 'EXISTS');
        db.get('x', function (err, value) {
            t.equal(
                err.type, 'NotFoundError',
                'aborted batch should thoroughly fail'
            );
        });
    });
});
