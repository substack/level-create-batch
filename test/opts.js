var test = require('tape');
var level = require('level-test')();
var db = level('users.db-' + Math.random(), { valueEncoding: 'json' });
var create = require('level-create');
var batch = require('../');

test('put with custom opts', function (t) {
    t.plan(2);
    
    create(db, 'index', 1000, function (err) {
        var rows = [
          { key: '737562737461636b', value: '697320636f6f6c', keyEncoding: 'hex', valueEncoding: 'hex' }
        ];
        batch(db, rows, function (err) {
            t.ifError(err);
            db.get('substack', {valueEncoding: 'utf8'}, function(err, row) {
              t.equals(row, 'is cool');
            });
        });
    });
});