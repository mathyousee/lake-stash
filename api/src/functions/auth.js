const { app } = require('@azure/functions');

app.http('userInfo', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'auth/user',
    handler: async (request, context) => {
        try {
            const clientPrincipal = request.headers.get('x-ms-client-principal');
            
            // Development mode: check if we're running locally
            const isDevelopment = process.env.NODE_ENV !== 'production' && 
                                 !process.env.WEBSITE_HOSTNAME;
            
            if (!clientPrincipal) {
                // In development, provide a mock user for testing
                if (isDevelopment) {
                    return {
                        status: 200,
                        body: JSON.stringify({
                            authenticated: true,
                            user: {
                                id: 'dev-user-123',
                                name: 'Development User',
                                provider: 'development',
                                roles: []
                            },
                            development: true
                        })
                    };
                }
                
                return {
                    status: 200,
                    body: JSON.stringify({ 
                        authenticated: false,
                        user: null 
                    })
                };
            }

            try {
                const principal = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('ascii'));
                
                return {
                    status: 200,
                    body: JSON.stringify({
                        authenticated: true,
                        user: {
                            id: principal.userId,
                            name: principal.userDetails,
                            provider: principal.identityProvider,
                            roles: principal.userRoles || []
                        }
                    })
                };
            } catch (error) {
                console.error('Error parsing client principal:', error);
                return {
                    status: 200,
                    body: JSON.stringify({ 
                        authenticated: false,
                        user: null 
                    })
                };
            }
        } catch (error) {
            console.error('Error in userInfo endpoint:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});
