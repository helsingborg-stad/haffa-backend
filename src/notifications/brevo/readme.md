# Brevo notifications

Notifications are sent via the transactional mail service [www.brevo.com](https://www.brevo.com/) when environment contains:

```sh
BREVO_API_KEY=<api key>
BREVO_FROM_NAME=<sender name>
BREVO_FROM_EMAIL=<sender email>
```

Templates must be named `pincode-requested`, `advert-was-reserved` etc. according
to the common name of the notification event. See [types.ts](types.ts) for more details.
