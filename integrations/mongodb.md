# MongoDB as persistence layer

MongoDB is the recommended choice in Haffa for persistence of

- adverts
- profiles
- settings
- login process state

MongoDB is chosen in runtime based on existence of certain environment variables (_MONGODB_URI_).

## Configuration

### Environment variables

| Name                        | Required | Default value |
| --------------------------- | -------- | ------------- |
| MONGODB_URI                 | Yes      |               |
| MONGODB_ADVERTS_COLLECTION  | No       | adverts       |
| MONGODB_LOGIN_COLLECTION    | No       | login         |
| MONGODB_PROFILE_COLLECTION  | No       | profile       |
| MONGODB_SETTINGS_COLLECTION | No       | settings      |

## Local environment with docker

Start a dockerized MongoDB with

```sh
docker run --name mongodb -p 27017:27017 -d mongo

```

Ensure `.env` contains

```env
MONGODB_URI=mongodb://127.0.0.1:27017/haffa
```
