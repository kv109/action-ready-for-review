const Core = require('@actions/core');
const Github = require('@actions/github');
const Slack = require('node-slack');

const DefaultFormat = `:rocket: New PR ready for review! :rocket:\nTitle: *{ pull_request.title }*\nAuthor: { pull_request.user.login }\nURL: { pull_request.html_url }`;

try {
    e = process.env;
    config = {
        channel: e.SLACK_CHANNEL,
        format: e.FORMAT || DefaultFormat,
        hookUrl: e.SLACK_WEBHOOK,
        ignoreDrafts: e.IGNORE_DRAFTS || true,
        username: e.USERNAME || 'ReadyForReviewBot'
    };

    if (!config.channel) {
        Core.setFailed("Slack channel is not set. Set it with\nenv:\n\tSLACK_CHANNEL: your-channel");
    }
    if (!config.hookUrl) {
        Core.setFailed("SLACK_WEBHOOK is not set. Set it with\nenv:\n\tSLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}\n");
    }

    const payload = Github.context.payload;

    if (payload.action !== "ready_for_review" && payload.action !== "opened") {
        return
    }

    const pr = payload.pull_request;
    const slack = new Slack(config.hookUrl);
    // console.log(JSON.stringify(payload, null, 2));

    if (payload.pull_request.draft && config.ignoreDrafts === true) {
        return
    }

    let message = config.format;
    config.format.match(/\{.+\}/g).forEach(template => {
        const templateWithoutBrackets = template
            .replace(/^\{\s?/, "")
            .replace(/\s?\}$/, "");

        const keys = templateWithoutBrackets.split(".")
        console.log(keys)
        let value = payload;
        keys.forEach(key => {
            try {
                value = value[key];
            } catch (error) {
                console.log(error);
            }
        });
        console.log(value);
        message = message.replace(template, value);
    });

    slack.send({
        text: message,
        channel: '#' + config.channel,
        username: config.username
    });
} catch (error) {
    Core.setFailed(error.message);
}