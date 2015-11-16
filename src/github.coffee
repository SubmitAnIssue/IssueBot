request = require 'request'
dbCtrl = require './dbController'

clientID = process.env.CLIENT_ID
clientSecret = process.env.CLIENT_SECRET

# Class for interaction with Github's API
class Github
    # Get user's access token and append it to DB
    #
    # @example
    #   Github.getToken('9gjs03nv6d', (err, token) ->
    #          console.err err if err
    #          console.log token if token
    #       )
    #
    # @param [String] code User code recieved after authenticating through Github
    # @param [Function] cb Callback that will be called after system recieve user's access token with two params: error and userID
    # @see https://developer.github.com/v3/oauth/#redirect-users-to-request-github-access How to get user code
    # @see https://developer.github.com/v3/oauth/#github-redirects-back-to-your-site How to get access token
    # @author g07cha
    @getToken: (code, cb) ->
        request.post({
            'url': 'https://github.com/login/oauth/access_token',
            'headers': {
                'Accept': 'application/json'
            },
            'json': true,
            'body': {
                'client_id': clientID,
                'client_secret': clientSecret,
                'code': code
            }
        }, (err, res, body) -> 
            if err
                cb(err)
            else if body.error
                cb(body)
            else
                userID = dbCtrl.addUser(body.access_token)
                cb({}, userID)
        )
    # Submit issue to github repository
    #
    # @example
    #   Github.submitIssue('74fs8f9nf7', {'title': 'Found a bug', 'body': 'I'm having a problem with this.'})
    #
    # @param [String] userID Key that stored in DB for specific repository
    # @param [Object] content Parameters for issue that will be submitted
    # @see https://developer.github.com/v3/issues/#create-an-issue Github refernece about issue parameters
    # @author g07cha
    # @todo Add content validation
    @submitIssue: (userID, content) ->
        dbCtrl.findUser(userID, (err, data) -> 
            console.error err if err
            
            url = 'https://api.github.com/repos/#{data.repo}/issues'
            
            request.post({
                'headers': {
                    'Authorization': 'token #{data.token}'
                },
                'url': url,
                'body': content
                }).on('response', (res) ->
                    console.log res
                ).on('error', (err) ->
                    console.error err
                )
        )

module.exports = Github