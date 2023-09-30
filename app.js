require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const swaggerUi = require('swagger-ui-express');
const tasksServiceDocumentation = require('./documentation/tasks.json');

const swaggerSpec = tasksServiceDocumentation;

const app = express();

app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.sequelize.sync();

db.sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((error) => {
        console.log('Unable to connect to the database:', error);
    });

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Tasks API.' });
});

/** Render swagger documentation on /api-docs route */
app.get('/api-docs.json', (_request, response) => response.send(swaggerSpec));
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', (_request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.send(swaggerUi.generateHTML(swaggerSpec));
});

require('./routes/task.route')(app);

// set port to listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
