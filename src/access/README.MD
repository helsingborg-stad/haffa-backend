# Access mapper for Haffa application

This service is offering access verification of e-mail addresses and mapping towards roles.

Modify your .env to include the following variable:

```sh
FS_ACCESS_FILE=<The full path of the access file>
```

## File format

```JSON
[
  {
    "pattern": ".*@helsingborg.se",
    "roles": ["Administratör", "Kommun"]
  }
]
```

## Usage

```javascript
const access = createAccessServiceFromEnv()

if (access.isAuthorized('email@email.se')) {
  // User may access the application
}
if (access.hasRole('email@email.se', 'Administratör')) {
  // User may access administrative functions
}
```
