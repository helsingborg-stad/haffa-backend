# File system persistence

Haffa can work with a file system as a persistence layer.
This is fine for small installations and local development but performance is poor compared to [MongoDB](mongodb.md) for managing adverts, profiles and login state.

[Minio](minio.md) might also be a better choice when it comes to maning user submitted assets (i.e. advert images).

## Configuration

### Environment variables

| Name         | Required | Default value |
| ------------ | -------- | ------------- |
| FS_DATA_PATH | Yes      |               |

## Local environment

Ensure `.env` contains

```env
FS_DATA_PATH=./.local
```
