# ReadyForReview - Slack Notifier

**ReadyForReview** notifies you 
- when a pull request is ready for review (i.e. when a non-draft PR is opened or a draft PR is ready for review),
- when a pull request is accepted and
- when a pull request is rejected.

![image](https://user-images.githubusercontent.com/399968/76140067-e8f44d00-6056-11ea-98f5-629903599bf4.png)

### Setup

1. Generate your Slack webhook. You can do it [here](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks).
1. Add created webhook as a secret named `SLACK_WEBHOOK` using GitHub Action's Secret. See your project Settings -> Secrets.
1. Create `.github/workflows/main.yml` and put there content like the ones from [examples](https://github.com/kv109/action-ready-for-review#example-usage).

Don't forget about enabling local and third party actions for your repository in your project Settings -> Actions!

### Example usage

```yaml
on: 
  pull_request:
    types: [opened, ready_for_review]
  pull_request_review:
    types: [submitted]
name: Notify about PR ready for review
jobs:
  slackNotification:
    name: Slack Notification
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Slack Notification
      uses: kv109/action-ready-for-review@0.2
      env:
        SLACK_CHANNEL: your-slack-channel           # required
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }} # required
```

```yaml
on: 
  pull_request:
    types: [opened, ready_for_review]
  pull_request_review:
    types: [submitted]
name: Notify about PR ready for review
jobs:
  slackNotification:
    name: Slack Notification
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Slack Notification
      uses: kv109/action-ready-for-review@0.2
      env:
        IGNORE_DRAFTS: false # Ignore draft pull requests. Default: true.
        PR_APPROVED_FORMAT: | # Format is fully customizable.
          *{ pull_request.title }* was approved by { review.user.login } :heavy_check_mark:
        PR_READY_FOR_REVIEW_FORMAT: |
          New PR! :smile:
          Title: *{ pull_request.title }*
          Author: { pull_request.user.login }
          URL: { pull_request.html_url }
        PR_REJECTED_FORMAT: |
          *{ pull_request.title }* was rejected by { review.user.login } :cry:
        SLACK_CHANNEL: your-slack-channel
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
        USERNAME: Your username
```

## Formatting
Any string inside brackets is replaced with a value taken from an actual event payload.
All available values can be found [here](https://developer.github.com/v3/activity/events/types/#webhook-event-name-34) and [here](https://developer.github.com/v3/activity/events/types/#webhook-event-name-35).
