const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Initialize Cosmos client
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_DB_ENDPOINT || 'https://localhost:8081',
    key: process.env.COSMOS_DB_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
});

const database = cosmosClient.database('LakeStashDB');
const container = database.container('Inventory');

// Helper function to get user from Azure Static Web Apps authentication
function getUserFromRequest(request) {
    const clientPrincipal = request.headers.get('x-ms-client-principal');
    
    // Development mode: check if we're running locally
    const isDevelopment = process.env.NODE_ENV !== 'production' && 
                         !process.env.WEBSITE_HOSTNAME;
    
    if (!clientPrincipal) {
        // In development, provide a mock user for testing
        if (isDevelopment) {
            return {
                id: 'dev-user-123',
                name: 'Development User',
                provider: 'development'
            };
        }
        return null;
    }
    
    try {
        const principal = JSON.parse(Buffer.from(clientPrincipal, 'base64').toString('ascii'));
        return {
            id: principal.userId,
            name: principal.userDetails,
            provider: principal.identityProvider
        };
    } catch (error) {
        console.error('Error parsing client principal:', error);
        return null;
    }
}

// Create a new inventory item
app.http('createInventoryItem', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'inventory',
    handler: async (request, context) => {
        try {
            const user = getUserFromRequest(request);
            if (!user) {
                return { 
                    status: 401, 
                    body: JSON.stringify({ error: 'Unauthorized' }) 
                };
            }

            const body = await request.json();
            const { name, quantity, category, status, notes, unit } = body;

            if (!name || quantity === undefined) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Name and quantity are required' })
                };
            }

            const item = {
                id: `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                name: name.trim(),
                quantity: parseFloat(quantity) || 0,
                category: category || 'Other',
                status: status || 'Enough',
                notes: notes || '',
                unit: unit || 'items',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const { resource } = await container.items.create(item);

            return {
                status: 201,
                body: JSON.stringify(resource)
            };
        } catch (error) {
            console.error('Error creating inventory item:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});

// Get all inventory items for a user
app.http('getInventoryItems', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'inventory',
    handler: async (request, context) => {
        try {
            const user = getUserFromRequest(request);
            if (!user) {
                return { 
                    status: 401, 
                    body: JSON.stringify({ error: 'Unauthorized' }) 
                };
            }

            const querySpec = {
                query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.updatedAt DESC',
                parameters: [
                    { name: '@userId', value: user.id }
                ]
            };

            const { resources } = await container.items.query(querySpec).fetchAll();

            return {
                status: 200,
                body: JSON.stringify(resources)
            };
        } catch (error) {
            console.error('Error fetching inventory items:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});

// Update an inventory item
app.http('updateInventoryItem', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'inventory/{id}',
    handler: async (request, context) => {
        try {
            const user = getUserFromRequest(request);
            if (!user) {
                return { 
                    status: 401, 
                    body: JSON.stringify({ error: 'Unauthorized' }) 
                };
            }

            const itemId = request.params.id;
            const body = await request.json();

            // First, verify the item belongs to the user
            try {
                const { resource: existingItem } = await container.item(itemId, user.id).read();
                if (!existingItem || existingItem.userId !== user.id) {
                    return {
                        status: 404,
                        body: JSON.stringify({ error: 'Item not found' })
                    };
                }

                // Update the item
                const updatedItem = {
                    ...existingItem,
                    ...body,
                    id: itemId,
                    userId: user.id,
                    updatedAt: new Date().toISOString()
                };

                const { resource } = await container.item(itemId, user.id).replace(updatedItem);

                return {
                    status: 200,
                    body: JSON.stringify(resource)
                };
            } catch (error) {
                if (error.code === 404) {
                    return {
                        status: 404,
                        body: JSON.stringify({ error: 'Item not found' })
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error('Error updating inventory item:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});

// Delete an inventory item
app.http('deleteInventoryItem', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'inventory/{id}',
    handler: async (request, context) => {
        try {
            const user = getUserFromRequest(request);
            if (!user) {
                return { 
                    status: 401, 
                    body: JSON.stringify({ error: 'Unauthorized' }) 
                };
            }

            const itemId = request.params.id;

            try {
                // Verify the item belongs to the user before deleting
                const { resource: existingItem } = await container.item(itemId, user.id).read();
                if (!existingItem || existingItem.userId !== user.id) {
                    return {
                        status: 404,
                        body: JSON.stringify({ error: 'Item not found' })
                    };
                }

                await container.item(itemId, user.id).delete();

                return {
                    status: 204,
                    body: ''
                };
            } catch (error) {
                if (error.code === 404) {
                    return {
                        status: 404,
                        body: JSON.stringify({ error: 'Item not found' })
                    };
                }
                throw error;
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            return {
                status: 500,
                body: JSON.stringify({ error: 'Internal server error' })
            };
        }
    }
});
