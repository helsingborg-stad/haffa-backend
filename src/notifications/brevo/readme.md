# Brevo notifications

Notifications are sent via the transactional mail service [www.brevo.com](https://www.brevo.com/) when environment contains:

```sh
BREVO_API_KEY=<api key>
BREVO_FROM_NAME=<sender name>
BREVO_FROM_EMAIL=<sender email>
```

Templates must be named `pincode-requested`, `advert-was-reserved` etc. according
to the common name of the notification event. See [notifications documentation](../README.md) or [types.ts](types.ts) for more details.

## Sample templates

Brevo templates have access to whatever triggered a notification via handlebars syntax as in `{{ params.advert.name }}`. Which templates are available and which properties can be accessed is descibed in [notifications documentation](../README.md).

| Event               | Template                                  |
| ------------------- | ----------------------------------------- |
| pincode-requested   | Din pinkod är {{params.pincode}}          |
| advert-was-reserved | Du har reserverat {{params.advert.title}} |
