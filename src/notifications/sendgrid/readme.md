 # SendGrid notifications

 Notifications are sent via the transactional mail service [www.sendgrid.com](www.sendgrid.com) when environment contains
 
 ```sh
 SENDGRID_API_KEY=<api key>
 SENDGRID_FROM=<verified sender email>
 ```

 For a full experience
 - the API key must have permission to *Mail Send* and *Template Engine*
 - templates named *pincode-requested*, *advert-was-reserved* and so on should exist. Please checkout [sendgrid-mail-sender.ts](sendgrid-mail-sender.ts) for details and bindings.