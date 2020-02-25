# ReadyToReview - Slack Notifier

**ReadyToReview** notifies you when a pull request is ready for review, i.e. when
- a non-draft PR is opened or
- a draft PR is ready to review.

### Setup

1. Generate your Slack webhook. You can do it [here](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks).
1. Add created webhook as a secret named `SLACK_WEBHOOK` using GitHub Action's Secret. See your project Settings -> Secrets.

### Example usage

```yaml
on: 
  pull_request:
    types: [opened, ready_for_review]
name: Notify about PR ready for review
jobs:
  slackNotification:
    name: Slack Notification
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Slack Notification
      uses: kv109/action-ready-to-review.git@0.1
      env:
        SLACK_CHANNEL: your-slack-channel           # required
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }} # required
```

```yaml
on: 
  pull_request:
    types: [opened, ready_for_review]
name: Notify about PR ready for review
jobs:
  slackNotification:
    name: Slack Notification
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Slack Notification
      uses: kv109/action-ready-to-review.git@0.1
      env:
        FORMAT: | # Format is fully customizable.
          My custom message format! :smile:
          Title: *{ pull_request.title }*
          Author: { pull_request.user.login }
          URL: { pull_request.html_url }
        IGNORE_DRAFTS: false # Notify also about drafts. Default: true.
        SLACK_CHANNEL: your-slack-channel
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        USERNAME: Your username
```

## Formatting
Any string inside brackets is replaced with a value taken from an actual event payload.
All available values can be found [here](https://developer.github.com/v3/activity/events/types/#webhook-payload-example-28).