# Integrations

## Persistence layer selection
In runtime, the actual driver is chosen based on environment configuration.

In order of precedence (from top to bottom), the rules are

| Environment      | Adverts     | Profiles    | Files       | Login      | Notifications |
| ---------------- | ----------- | ----------- | ----------- | ---------- | ------------- |
| MONGOBD_URI      | MongoDB     | MongoDB     |             | MongoDB    |               |
| FS_DATA_PATH     | File system | File system | File system |            |               |
| SENDGRID_API_KEY |             |             |             |            | SendGrid      |
| \<none>          | In memory   | In memory   | In memory   | In memory  | console       |

## MongoDB as persistence layer

This project is tested against MongoDB with the following assumptions:

- `MONGODB_URI` should be set to `mongodb://[host]:[port]/[db]` as in `mongodb://127.0.0.1:27017/haffa`

### Enabling MongoDB
Your environment should contain

```sh
MONGODB_URI=mongodb://...
```

## Local environment with docker

Start a dockerized MongoDB with
```sh
docker run --name mongodb -p 27017:27017 -d mongo

```
 Ensure `.env` contains
 ```env
 MONGODB_URI=mongodb://127.0.0.1:27017/haffa
 ``` 

### SendGrid notifications

Mail notifications can be sent using [www.sendgrid.com](www.sendgrid.com).

See [SendGrid integration guide](./src/notifications/sendgrid/readme.md) for more details.
