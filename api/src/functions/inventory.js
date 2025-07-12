const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Initialize Cosmos client
let cosmosClient;
let cosmosInitialized = false;

// Development mode detection
const isDevelopment = process.env.NODE_ENV !== 'production' && 
                     !process.env.WEBSITE_HOSTNAME;

console.log(`🔧 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
console.log(`🔗 Cosmos endpoint: ${process.env.COSMOS_DB_ENDPOINT ? 'Set' : 'Not set'}`);
console.log(`🔑 Cosmos key: ${process.env.COSMOS_DB_KEY ? 'Set' : 'Not set'}`);

// Only initialize Cosmos DB in production when environment variables are available
if (!isDevelopment && (process.env.COSMOS_DB_ENDPOINT && process.env.COSMOS_DB_KEY)) {
    try {
        cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_DB_ENDPOINT,
            key: process.env.COSMOS_DB_KEY
        });
        cosmosInitialized = true;
        console.log('✅ Cosmos DB client initialized for production');
    } catch (error) {
        console.error('❌ Failed to initialize Cosmos DB client:', error);
    }
} else if (isDevelopment) {
    // In development, we'll use the dev server instead
    console.log('🔧 Development mode: Skipping Cosmos DB initialization');
} else {
    console.error('❌ Production mode but missing Cosmos DB environment variables');
}

// Database and container configuration
const databaseId = 'LakeStashDB';
const containerId = 'Inventory';

// Initialize database and container with auto-creation
async function initializeCosmosDB() {
    if (!cosmosInitialized) {
        throw new Error('Cosmos DB client not initialized - check environment variables');
    }
    
    try {
        // Create database if it doesn't exist
        const { database } = await cosmosClient.databases.createIfNotExists({ 
            id: databaseId,
            throughput: 400 // Minimum throughput for shared databases
        });
        
        // Create container if it doesn't exist
        const { container } = await database.containers.createIfNotExists({
            id: containerId,
            partitionKey: {
                paths: ['/userId'], // Partition by userId for user isolation
                kind: 'Hash'
            },
            indexingPolicy: {
                automatic: true,
                includedPaths: [
                    { path: '/*' } // Index all properties
                ],
                excludedPaths: [
                    { path: '/notes/*' } // Exclude notes from indexing for better performance
                ]
            }
        });
        
        console.log(`✅ Cosmos DB initialized: ${databaseId}/${containerId}`);
        return container;
    } catch (error) {
        console.error('❌ Error initializing Cosmos DB:', error);
        throw error;
    }
}

// Initialize on startup (for development - in production this might be done differently)
let containerInstance;
const getContainer = async () => {
    if (!containerInstance && cosmosInitialized) {
        containerInstance = await initializeCosmosDB();
    }
    return containerInstance;
};

// For immediate access in handlers (will auto-create if needed)
let database, container;
if (cosmosInitialized) {
    database = cosmosClient.database(databaseId);
    container = database.container(containerId);
}

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
            console.log('📥 POST /api/inventory - Starting request');
            
            const user = getUserFromRequest(request);
            if (!user) {
                console.log('❌ No user found in request');
                return { 
                    status: 401, 
                    body: JSON.stringify({ error: 'Unauthorized' }) 
                };
            }

            console.log(`👤 User: ${user.id} (${user.provider})`);

            const body = await request.json();
            const { name, quantity, category, status, notes, unit } = body;

            if (!name || quantity === undefined) {
                console.log('❌ Missing required fields');
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Name and quantity are required' })
                };
            }

            // Check if this is development mode
            if (isDevelopment) {
                console.log('🔧 Development mode: returning mock item');
                const mockItem = {
                    id: `dev-${Date.now()}`,
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
                return {
                    status: 201,
                    body: JSON.stringify(mockItem)
                };
            }

            // Check if Cosmos DB is initialized
            if (!cosmosInitialized || !container) {
                console.error('❌ Cosmos DB not initialized');
                return {
                    status: 500,
                    body: JSON.stringify({ 
                        error: 'Database not configured. Please check environment variables.',
                        details: {
                            cosmosInitialized,
                            hasEndpoint: !!process.env.COSMOS_DB_ENDPOINT,
                            hasKey: !!process.env.COSMOS_DB_KEY
                        }
                    })
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

            console.log('💾 Creating item in Cosmos DB...');
            const { resource } = await container.items.create(item);
            console.log(`✅ Created item with id: ${resource.id}`);

            return {
                status: 201,
                body: JSON.stringify(resource)
            };
        } catch (error) {
            console.error('❌ Error creating inventory item:', error);
            return {
                status: 500,
                body: JSON.stringify({ 
                    error: 'Internal server error',
                    message: error.message,
                    isDevelopment
                })
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
            console.log('📥 GET /api/inventory - Starting request');
            
            const user = getUserFromRequest(request);
            if (!user) {
                console.log('❌ No user found in request');
                return { 
                    status: 401, 
                    body: JSON.stringify({ error: 'Unauthorized' }) 
                };
            }

            console.log(`👤 User: ${user.id} (${user.provider})`);

            // Check if this is development mode
            if (isDevelopment) {
                console.log('🔧 Development mode: returning empty array');
                return {
                    status: 200,
                    body: JSON.stringify([])
                };
            }

            // Check if Cosmos DB is initialized
            if (!cosmosInitialized || !container) {
                console.error('❌ Cosmos DB not initialized');
                return {
                    status: 500,
                    body: JSON.stringify({ 
                        error: 'Database not configured. Please check environment variables.',
                        details: {
                            cosmosInitialized,
                            hasEndpoint: !!process.env.COSMOS_DB_ENDPOINT,
                            hasKey: !!process.env.COSMOS_DB_KEY
                        }
                    })
                };
            }

            const querySpec = {
                query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.updatedAt DESC',
                parameters: [
                    { name: '@userId', value: user.id }
                ]
            };

            console.log('🔍 Querying Cosmos DB...');
            const { resources } = await container.items.query(querySpec).fetchAll();
            console.log(`✅ Found ${resources.length} items`);

            return {
                status: 200,
                body: JSON.stringify(resources)
            };
        } catch (error) {
            console.error('❌ Error fetching inventory items:', error);
            return {
                status: 500,
                body: JSON.stringify({ 
                    error: 'Internal server error',
                    message: error.message,
                    isDevelopment
                })
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
