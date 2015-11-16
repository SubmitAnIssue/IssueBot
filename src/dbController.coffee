mongo = require 'mongoskin'
uuid = require 'uuid'
DB = process.env.DBPORT || 'users'
db = mongo.db("mongodb://localhost:27017/#{DB}", {native_parser: true})

db.bind('user').bind({
    getByID: (userID, callback) ->
        this.findOne({userID: userID}, callback)
})

# Class for interracting with MongoDB using Mongoskin
# @see https://github.com/kissjs/node-mongoskin Mongoskin reference
class dbController
    # Retrive user data from database
    #
    # @example
    #   dbController.findUser(userID, (err, data) -> 
    #       console.error if err
    #       console.log data
    #   )
    # @param [String] userID Key that stored in DB for specific repository
    # @param [Function] cb Callback that will be called with two params: error and data
    # @author g07cha
    @findUser: (userID, cb) ->
        db.user.getByID(userID, cb(err, data))
    
    # Add user to db
    #
    # @param [String] access_token Token for Github
    # @return [String] userID UUID for future queries
    # @author g07cha
    @addUser: (token) ->
        if token
            userID = uuid.v1();
            db.user.insertOne({token: token, userID: userID})
            userID

module.exports = dbController