import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 7071; // Default Azure Functions port

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Mock data store for development
let inventoryItems = [];
let itemIdCounter = 1;

// Mock user for development
const mockUser = {
    id: 'dev-user-123',
    name: 'Development User',
    provider: 'development'
};

// Helper function to get mock user
function getUserFromRequest(req) {
    // In development, always return the mock user
    return mockUser;
}

// Auth endpoint
app.get('/api/auth/user', (req, res) => {
    res.json({
        authenticated: true,
        user: mockUser,
        development: true
    });
});

// Get all inventory items
app.get('/api/inventory', (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Filter items by user (in dev mode, all items belong to the mock user)
    const userItems = inventoryItems.filter(item => item.userId === user.id);
    res.json(userItems);
});

// Create new inventory item
app.post('/api/inventory', (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, quantity, category, status, notes, unit } = req.body;

    if (!name || quantity === undefined) {
        return res.status(400).json({ error: 'Name and quantity are required' });
    }

    const newItem = {
        id: `${user.id}_${Date.now()}_${itemIdCounter++}`,
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

    inventoryItems.push(newItem);
    res.status(201).json(newItem);
});

// Update inventory item
app.put('/api/inventory/:id', (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const itemId = req.params.id;
    const updateData = req.body;

    const itemIndex = inventoryItems.findIndex(item => 
        item.id === itemId && item.userId === user.id
    );

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    // Update the item
    inventoryItems[itemIndex] = {
        ...inventoryItems[itemIndex],
        ...updateData,
        id: itemId,
        userId: user.id,
        updatedAt: new Date().toISOString()
    };

    res.json(inventoryItems[itemIndex]);
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const itemId = req.params.id;

    const itemIndex = inventoryItems.findIndex(item => 
        item.id === itemId && item.userId === user.id
    );

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }

    inventoryItems.splice(itemIndex, 1);
    res.status(204).send();
});

// Legacy message endpoint (for compatibility)
app.get('/api/mymessage', (req, res) => {
    res.json({ text: 'Hello from the development API server!' });
});

app.listen(PORT, () => {
    console.log(`🚀 Development API server running on http://localhost:${PORT}`);
    console.log(`📝 Available endpoints:`);
    console.log(`   GET  /api/auth/user`);
    console.log(`   GET  /api/inventory`);
    console.log(`   POST /api/inventory`);
    console.log(`   PUT  /api/inventory/:id`);
    console.log(`   DELETE /api/inventory/:id`);
    console.log(`\n🔧 Development mode: Using mock authentication`);
});
