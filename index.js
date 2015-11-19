var Hapi = require('hapi');
var Good = require('good');
var Joi = require('joi');
var DBCtrl = require('./src/dbController');
var queue = require('queue');
var Main = require('./src/main');

q = queue();

const DEBUG = process.env.DEBUG;

var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8080 });

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
            
            // Checking is queue contains tasks(not started yet)
            if(q.length) {
                q.push(function() {
                    Main.createIssue(msg, reply);
                    cb();
                });
            } else {
                Main.createIssue(msg, reply);
            }
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