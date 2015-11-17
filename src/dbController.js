var mongo = require('mongoskin');
var uuid = require('uuid');
const DB = process.env.DBPORT || 'users';

var db = mongo.db("mongodb://localhost:27017/" + DB, {
    native_parser: true
});

db.bind('user').bind({
    getByID: function(repoID, callback) {
        return this.findOne({
            repoID: repoID
        }, callback);
    }
});

var DBController = (function() {
    function DBController() {}

    DBController.findRepo = function(repoID, cb) {
        db.user.getByID(repoID, cb);
    };

    DBController.addRepo = function(repository) {
        if (repository) {
            var repoID = uuid.v1();
            db.user.insertOne({
                repository: repository,
                repoID: repoID
            });
            return repoID;
        }
    };
    
    return DBController;
})();

module.exports = DBController;
