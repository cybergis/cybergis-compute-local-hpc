var fs = require('fs');
var swaggerJsdoc = require('swagger-jsdoc');
var options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CyberGIS Compute',
            version: '1.0.0',
        },
    },
    apis: ['./server.ts'],
};
var output = swaggerJsdoc(options);
fs.writeFile('./production/swagger.json', JSON.stringify(output), function (err) { });
