var mongo = require('mongoskin');
var uuid = require('uuid');

var db = mongo.db(process.env.MONGOLAB_URI, {
    native_parser: true
});

db.bind('user').bind({
    getByID: function(repoID, callback) {
        return this.findOne({
            repoID: repoID
        }, callback);
    }
});

/**
 * Controller for interacting with MongoDB
 *
 * @class DBController
 */
var DBController = (function() {
    /**
     * @constructor
     */
    function DBController() {}

    /**
     * Find repository in :user/:repo format from database
     * 
     * @method findRepo
     * @param {String}   repoID UUID that can be accrued after calling DBController.addRepo function
     * @param {Function} cb     Callback that will be called with DB data object where repository located in data.repository
     */
    DBController.findRepo = function(repoID, cb) {
        db.user.getByID(repoID, cb);
    };

    /**
     * Add repository to DB
     * 
     * @method addRepo
     * @param   {String} repository Repository to add in format :user/:repo
     * @returns {String} Repo's UUID that can be used in DBController.findRepo function
     */
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
