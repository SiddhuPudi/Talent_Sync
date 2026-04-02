const swaggerJSDoc =  require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Talent Sync API",
            version: "1.0.0",
            description: "API documentation for Talent Sync backend"
        },
        servers: [
            { url: process.env.NODE_ENV === "production" ? "https://talent-sync-pq7j.onrender.com" : "http://localhost:3000" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ]
    },
    apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;