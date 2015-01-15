var lock = require('level-lock');

module.exports = function (db, rows, cb) {
    var locks = [];
    function unlock () {
        for (var i = 0; i < locks.length; i++) locks[i]();
    }
    
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!row) continue;
        if (row.type && row.type !== 'put' && row.type !== 'create') {
            unlock();
            return nextErr(cb, 'BATCH TYPE', 'invalid batch type: ' + row.type);
        }
        
        var un = lock(db, row.key, 'w');
        if (!un) {
            unlock();
            return nextErr(cb, 'LOCKED', 'key is write-locked');
        }
        else locks.push(un);
    }
    
    var pending = 0;
    var failed = false;
    
    for (var i = 0; i < rows.length; i++) (function (row) {
        if (!row) return;
        if (row.type === 'put') return;
        pending ++;
        
        db.get(row.key, function (err, res) {
            if (failed) return;
            if (err && err.type !== 'NotFoundError') {
                unlock();
                failed = true;
                return cb(err);
            }
            if (res || (err && err.type !== 'NotFoundError')) {
                unlock();
                failed = true;
                return cb(error('EXISTS', 'key already exists'));
            }
            if (-- pending === 0) insert();
        });
    })(rows[i]);
    
    if (pending === 0) process.nextTick(insert);
    
    function insert () {
        var updates = [];
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (!row) continue;
            updates.push({
              type: 'put',
              key: row.key,
              value: row.value,
              keyEncoding: row.keyEncoding,
              valueEncoding: row.valueEncoding
            });
        }
        db.batch(updates, function (err) {
            unlock();
            if (cb) cb(err);
        });
    }
};

function error (code, msg) {
    var err = new Error(msg);
    err.code = err.type = code;
    return err;
}

function nextErr (cb, code, msg) {
    var err = error(code, msg);
    if (cb) process.nextTick(function () { cb(err) });
}
