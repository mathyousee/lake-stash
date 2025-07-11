const { app } = require('@azure/functions');

app.http('mymessage', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        return { body: JSON.stringify({ "text": `Hello, from the API!` }) };
    }
});