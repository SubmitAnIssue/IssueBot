var Hapi = require('hapi');
var Good = require('good');
var Github = require('./lib/github');

var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.route({
    method: 'POST',
    path: '/api/register/{code}',
    handler: function(request, reply) {
        Github.getToken(request.params.code, function(err, userID) {
            if(err) console.error(err);
            console.log('userID:', userID);
            reply('http://SubmitAnIssue.github.io/finish?token=' + userIDs);
        });
    }
});

server.route({
    method: 'GET',
    path: '/api/submit',
    handler: function(request, reply) {
        console.log('Got request with params:', request.params);
        Github.submitIssue(request.params.userID, request.params.data)
    }
});

server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*'
            }
        }]
    }
}, function (err) {
    if (err) {
        throw err;
    }
    
    server.start(function () {
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});