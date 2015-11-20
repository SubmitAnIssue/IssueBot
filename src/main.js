var GitHubApi = require("github");
var async = require('async');

var github = new GitHubApi({
    version: "3.0.0",
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

var main = {
    createIssue: function(msg, reply) {
        github.issues.create(msg, function(err, data) {
            if(err) {
                console.log(err);

                if(err.message.indexOf('Not found') > -1) {
                    if(reply) {
                        reply(err.message)
                            .code(404);
                    }
                } else if(err.message.indexOf('API rate limit exceed') > -1) {
                    github.misc.rateLimit({}, function(err, data) {
                        var timeToReset = data.resources.core.reset * 1000;
                        q.push(function(cb) {
                            main.createIssue(msg);
                            cb();
                        });
                        
                        // Start executing tasks when timer reset
                        async.parallel([
                            function() {
                                setTimeout(function() {
                                    q.start();
                                }, timeToReset - new Date().getTime())}
                        ]);
                    });
                    
                    if(reply) {
                        reply(err.message)
                            .code(302);
                    }
                }
            } else {
                if(reply) {
                    return reply(data);
                }
            }
        });
    }
}

module.exports = main;