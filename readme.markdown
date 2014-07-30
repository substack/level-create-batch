# level-create-batch

insert a batch of keys if and only if none of the keys already exist

# example

Suppose you want to create a user account for a website using leveldb.

First you'll need to make sure that the requested username hasn't already been
taken. If you do a `db.get()` to check the username without
[locking the key](https://npmjs.org/package/level-lock) first, if two requests
come in to register the same username before any data is written, both requests
will indicate that the username is available and the database will be left in an
inconsistent state.

You can solve the problem of multiple simultaneous create requests for single
keys using [level-create](https://npmjs.org/package/level-create), but now
suppose that when a user creates an account, you also want to create a username
and password in a separate key. Ordinarily in leveldb you could do this with
`db.batch`:

``` js
db.batch([
  { type: 'put', key: 'user!substack', value: { bio: 'beep boop' } },
  { type: 'put', key: 'login!substack', value: { salt: '...', hash: '...' } }
])
```

`db.batch()` is atomic, so if the server crashed between inserting the first key
and the second, both keys would not be written. Otherwise, a user might be
accidentally created who couldn't log in, or a login might be created for a user
that didn't exist.

We lose the atomicity benefits of `db.batch()` when using individual key locks
with [level-create](https://npmjs.org/package/level-create), but with
level-create-batch, we can do safe multi-record inserts if and only if all the
requested keys do not yet exist:

``` js
var level = require('level');
var db = level('/tmp/users.db', { valueEncoding: 'json' });
var batch = require('level-create-batch');

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
```

