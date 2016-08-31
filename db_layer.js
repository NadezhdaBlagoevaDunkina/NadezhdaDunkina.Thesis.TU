module.exports = { 
    getUser: function (username, connection, callback) { //anonimna funkciq
        connection.query(
        'select * from users ' +
        'where username="' + username + '"',
         function (err, rows) {
            if (err) throw err;
    //   console.log(rows.length);
            if (rows.length == 1) { //proverqva se dali masivut e prazen i dali imash samo 1 potrebitel
                var user;
                //syzdavam nov obekt user s username, password, email, salt i isadmin
                user = {id: rows[0].id, username: username, password: rows[0].password, email: rows[0].email, salt: rows[0].salt, isadmin: rows[0].isadmin};
                callback(user);
            } else {
                //null
                callback(null);
            }
         }
    );
    }
};
