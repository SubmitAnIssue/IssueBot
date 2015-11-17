mongo = require 'mongoskin'
uuid = require 'uuid'
DB = process.env.DBPORT || 'users'
db = mongo.db("mongodb://localhost:27017/#{DB}", {native_parser: true})

db.bind('user').bind({
    getByID: (repoID, callback) ->
        this.findOne({repoID: repoID}, callback)
})

# Class for interracting with MongoDB using Mongoskin
# @see https://github.com/kissjs/node-mongoskin Mongoskin reference
class DBController
    # Retrive repository data from database
    #
    # @example
    #   dbController.findRepo(repoID, (err, data) -> 
    #       console.error if err
    #       console.log data
    #   )
    # @param [String] repoID Key that stored in DB for specific repository
    # @param [Function] cb Callback that will be called with two params: error and data
    # @author g07cha
    @findRepo: (repoID, cb) ->
        db.user.getByID(repoID, cb)
    
    # Add repository to db
    #
    # @param [String] repository "username/name" string
    # @return [String] repoID UUID for future queries
    # @author g07cha
    @addRepo: (repository) ->
        if repository
            repoID = uuid.v1();
            db.user.insertOne({repository: repository, repoID: repoID})
            repoID

module.exports = DBController