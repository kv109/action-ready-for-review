const Core = require('@actions/core');
const Github = require('@actions/github');
const Slack = require('node-slack');

const DefaultPRApprovedFormat = `Pull request *{ pull_request.title }* was approved by { review.user.login } :heavy_check_mark:`;
const DefaultPRChangesRequestedFormat = `Pull request *{ pull_request.title }* was rejected by { review.user.login } :cry:`;
const DefaultPRReadyForReviewFormat = `:rocket: New PR ready for review! :rocket:\nTitle: *{ pull_request.title }*\nAuthor: { pull_request.user.login }\nURL: { pull_request.html_url }`;

const fillTemplate = (payload, template) => {
    let message = template;
    template.match(/\{(.*?)\}/g).forEach(template => {
        const templateWithoutBrackets = template
            .replace(/^\{\s?/, "")
            .replace(/\s?\}$/, "");

        const keys = templateWithoutBrackets.split(".");

        let value = payload;
        keys.forEach(key => {
            try {
                if (value[key]) {
                    value = value[key];
                }
            } catch (error) {
                console.log(error);
            }
        });
        message = message.replace(template, value);
    });
    return message;
};

try {
    e = process.env;
    config = {
        channel: e.SLACK_CHANNEL,
        hookUrl: e.SLACK_WEBHOOK,
        ignoreDrafts: e.IGNORE_DRAFTS || true,
        pr_approved_format: e.PR_APPROVED_FORMAT || DefaultPRApprovedFormat,
        pr_ready_for_review_format: e.PR_READY_FOR_REVIEW_FORMAT || DefaultPRReadyForReviewFormat,
        pr_rejected_format: e.PR_REJECTED_FORMAT || DefaultPRChangesRequestedFormat,
        username: e.USERNAME || 'ReadyForReviewBot'
    };

    if (!config.channel) {
        Core.setFailed("Slack channel is not set. Set it with\nenv:\n\tSLACK_CHANNEL: your-channel");
    }
    if (!config.hookUrl) {
        Core.setFailed("SLACK_WEBHOOK is not set. Set it with\nenv:\n\tSLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}\n");
    }

    const payload = Github.context.payload;
    const review = payload.review;
    const pr = payload.pull_request;
    let message;

    if (!review && payload.action !== "ready_for_review" && payload.action !== "opened") {
        return
    }

    const slack = new Slack(config.hookUrl);

    if (review) {
        if (payload.review.state == "approved") {
            message = fillTemplate(payload, config.pr_approved_format);
        } else if (payload.review.state == "changes_requested") {
            message = fillTemplate(payload, config.pr_rejected_format);
        }
    } else {
        if (pr.draft && config.ignoreDrafts === true) {
            return
        }

        message = fillTemplate(payload, config.pr_ready_for_review_format);
    }

    slack.send({
        text: message,
        channel: '#' + config.channel,
        username: config.username
    });
} catch (error) {
    Core.setFailed(error.message);
}