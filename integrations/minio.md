# Minio file persistence

Minio is a good choice for storing files (i.e. user submited images).

## Configuration

### Environment variables

The enviroment variables below are mapped from [Minio's official driver](https://github.com/minio/minio-js#initialize-minio-client)

| Name             | Required | Default value |
| ---------------- | -------- | ------------- |
| MINIO_ENDPOINT   | Yes      |               |
| MINIO_ACCESS_KEY | Yes      |               |
| MINIO_SECRET_KEY | Yes      |               |
| MINIO_PORT       | No       | 9000          |
| MINIO_BUCKET     | No       | haffa         |
| MINIO_REGION     | No       | eu-north-1    |
| MINIO_USE_SSL    | No       | false         |

## Local environment with docker

Start a dockerized MongoDB with

```sh
docker run -p 9000:9000 -p 9001:9001 quay.io/minio/minio server /data --console-address ":9001"
```

Once started, log in to http://localhost:9001 with minioadmin/minioadmin and create a access key/secret key pair.

Ensure `.env` contains

```env
MINIO_ENDPOINT=127.0.0.1
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
```

For more information, visit [https://hub.docker.com/r/minio/minio](https://hub.docker.com/r/minio/minio)
