# Employee Directory

## Quick Start

```
1. git clone https://github.com/bgoosman/employee-directory.git
2. cd employee-directory
3. docker build -t employee-directory-frontend ./frontend
4. docker build -t employee-directory-backend ./backend
5. docker-compose up
6. curl "http://127.0.0.1:4000/make-database"
```

## Features

- Develop diary: docs/diary.md
- Filter employees by name, email, title, department
- Profile pic expands on hover
- Next/previous pagination
- Employee CRUD
- Source data from https://randomuser.me

## Live reloading during development

Uncomment the volumes options in docker-compose.yml