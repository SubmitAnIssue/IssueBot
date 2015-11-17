var Hapi = require('hapi');
var Good = require('good');
var Joi = require('joi');
var GitHubApi = require("github");
var DBCtrl = require('./src/dbController');

const DEBUG = process.env.DEBUG;

var github = new GitHubApi({
    version: "3.0.0",
    debug: DEBUG,
    protocol: "https",
    timeout: 5000,
    headers: {
        "user-agent": "SubmitIssueBot"
    }
});

github.authenticate({
    type: "basic",
    username: process.env.USERNAME,
    password: process.env.PASSWORD
});

var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 3000 });

server.route({
    method: 'POST',
    path: '/api/register',
    handler: function(request, reply) {
        var repoID = DBCtrl.addRepo(request.payload.repo)
        reply(repoID);
    },
    config: {
        validate: {
            payload: {
                repo: Joi.string().min(3).required()
            }
        }
    }
});

server.route({
    method: 'POST',
    path: '/api/submit',
    handler: function(request, reply) {
        var data = request.payload.data;
        var msg = {
            'title': data.title,
            'body': data.body            
        }
        
        var repo = DBCtrl.findRepo(request.payload.repoID, function(err, data) {
            if(err) console.error(err);
            if(DEBUG) console.log(data);
            
            msg.user = data.repository.split('/')[0];
            msg.repo = data.repository.split('/')[1];
            
            github.issues.create(msg, function(err, data) {
                if(err) {
                    console.log(err);
                    return reply(err.message, null)
                                .code(404);
                } else {
                    return reply(data);
                }
            });
        });
    },
    config: {
        validate: {
            payload: {
                repoID: Joi.string().min(36).max(36).required(),
                data: Joi.object().keys({
                    title: Joi.string().required(),
                    body: Joi.string()
                }).required()
            }
        }
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