# Integrations

Haffa manages high level concepts such as

- persistence and querying of adverts and profiles
- persistence of settings (categories, login policies, api keys...)
- managing password-less authentication flows
- notifying users about intersting state changes

These concepts are caried out by different drivers, from which alternatives can be chosen based on performance requirements, budget etc.

| Feature                                      | Production  | QA          | Local development | Unit testing   |
| -------------------------------------------- | ----------- | ----------- | ---------------- | -------------- |
| [Minio](minio.md)                            | Recommended | Recommended | Situational      | Probably never |
| [MongoDB](mongodb.md)                        | Recommended | Recommended | Situational      | Probably never |
| [File System](fs.md)                         | Low budget  | Low budget  | Situational      | Probably never |
| [Transactional email notifications](mail.md) | Recommended | Recommended | Situational      | Probably never |
| [Memory](memory.md)                          | Never       | Situational | Situational      | Always         |

## Driver selection

In runtime, the actual driver is chosen based on environment configuration.

In order of precedence (from top to bottom), the rules are

| Adverts and profiles  | Files                | Login state           | Notifications                                |
| --------------------- | -------------------- | --------------------- | -------------------------------------------- |
| [MongoDB](mongodb.md) |                      | [MongoDB](mongodb.md) |                                              |
|                       | [Minio](minio.md)    |                       |                                              |
| [File System](fs.md)  | [File System](fs.md) |                       |                                              |
|                       |                      |                       | [Transactional email notifications](mail.md) |
| [Memory](memory.md)   | [Memory](memory.md)  | [Memory](memory.md)   | console                                      |
