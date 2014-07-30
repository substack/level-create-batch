var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var create = require('level-create');
var batch = require('../');

test('empty', function (t) {
    t.plan(2);
    
    var i = 0;
    batch(db, [], function (err) {
        t.ifError(err);
        i ++;
    });
    
    t.equal(i, 0, 'not the same tick');
});
