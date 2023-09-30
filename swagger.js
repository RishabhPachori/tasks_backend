const swaggerUi = require('swagger-ui-express');
const tasksServiceDocumentation = require('./documentation/tasks.json');

const NODE_ENV = 'development';

const swaggerSpec = tasksServiceDocumentation;

/** It contains swagger configuration and initiates swagger and exposes swagger routes to be used by express app. */
const initiateSwagger = (router) => {
    /** Serve swagger docs only for non-production environments */
    const isDevelopmentEnvironment = NODE_ENV === 'development';
    if (isDevelopmentEnvironment) {
        /** Show api docs content as json */
        router.get('/api-docs.json', (_request, response) => response.send(swaggerSpec));

        router.use('/api-docs', swaggerUi.serve);
        /** Serve html */
        router.get('/api-docs', (_request, response) => {
            response.setHeader('Content-Type', 'text/html');
            response.send(swaggerUi.generateHTML(swaggerSpec, {
                customCss: `img[alt="Swagger UI"] {
                    display: block;
                    -moz-box-sizing: border-box;
                    box-sizing: border-box;
                    content: url('https://lynkit.in/static/media/lynkit.b2a96ca4.png');
                    max-width: 100%;
                    max-height: 100%;
                }`,
                customSiteTitle: 'Lynkit',
                customfavIcon: '/assets/favicon.ico'
            }));
        });
    }
};

module.exports = initiateSwagger;

