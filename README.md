# Task Manager

Task Manager is a Node.js application that allows users to manage tasks. It provides a RESTful API for creating, updating, deleting, and retrieving tasks, as well as obtaining task metrics based on their status.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- MySQL server installed and running
- XAMPP or a similar environment for MySQL

### Usage
* Run `npm i` to install all the dependencies.
* Start mysql server.
* Add `.env` file to the root of this project with following configuration.
```
PORT=<Port of your choice>
DB_NAME = 'test_lynktrac_v2'
DB_HOST = '127.0.0.1'
DB_USER = 'test'
DB_PASSWORD = 'test'


* Run `npm start` to run the server.

Access the application in your web browser at http://localhost:8000.

Access the application swagger documentation in your web browser at http://localhost:8000/api-docs
