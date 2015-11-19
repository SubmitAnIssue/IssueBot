var GitHubApi = require("github");

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
                // TODO: Catch requests limit and save to queue
                console.log(err);
                const response = reply(err.message)

                if(err.message.indexOf('Not found') > -1) {
                    response.code(404);
                } else if(err.message.indexOf('API rate limit exceed')) {
                    github.misc.rateLimit({}, function(err, data) {
                        var timeToReset = data.rate.reset * 1000;
                        q.push(function(cb) {
                            main.createIssue(msg, reply);
                            cb();
                        });
                        
                        // Start executing tasks when timer reset
                        setTimeout(q.start(), timeToReset - new Date().getTime());
                    });
                    response.code(302);
                }
            } else {
                return reply(data);
            }
        });
    }
}

module.exports = main;