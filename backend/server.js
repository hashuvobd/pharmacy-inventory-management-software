require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'med-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

const app = express();

// Middleware
app.use(cors());
// Parses incoming JSON requests (increased limit for large CSV uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/backend/uploads', express.static(path.join(__dirname, 'uploads')));

// Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ---------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------
const apiRouter = express.Router();

// A simple health check route
apiRouter.get('/status', (req, res) => {
    res.json({ message: 'Backend is running correctly with Supabase!' });
});

// Image Upload Route
apiRouter.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        
        // Generate the URL for the uploaded file
        // For local development it will be relative, e.g. /uploads/filename.jpg
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({ success: true, url: fileUrl });
    } catch (error) {
        console.error('Error during upload:', error);
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});

// Test database connection route
apiRouter.get('/test-db', async (req, res) => {
    try {
        const { data, error } = await supabase.from('medicines').select('*').limit(1);
        if (error) throw error;
        res.json({ 
            success: true, 
            message: 'Successfully connected to database!', 
            data: data
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message,
            code: error.code
        });
    }
});

// Example: Get all medicines
apiRouter.get('/medicines', async (req, res) => {
    try {
        const { data, error } = await supabase.from('medicines').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Failed to fetch medicines:', error);
        res.status(500).json({ error: 'Failed to fetch data from database' });
    }
});

// Example: Add a new medicine
apiRouter.post('/medicines', async (req, res) => {
    try {
        const { brand_name, stock, price } = req.body;
        
        const { data, error } = await supabase
            .from('medicines')
            .insert([{ brand_name, stock, price }])
            .select();
        
        if (error) throw error;
        res.status(201).json({ message: 'Medicine added successfully', id: data[0].id });
    } catch (error) {
        console.error('Failed to add medicine:', error);
        res.status(500).json({ error: 'Failed to add data to database' });
    }
});

// BULK IMPORT MEDICINES (From CSV)
apiRouter.post('/medicines/bulk', async (req, res) => {
    try {
        const medicines = req.body;
        if (!Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({ error: 'No data provided' });
        }
        
        // Create an array of objects for bulk insertion
        const values = medicines.map(m => ({
            brand_id: m.brandId || null,
            brand_name: m.name || 'Unnamed',
            type: m.type || null,
            slug: m.slug || null,
            dosage_form: m.dosageForm || null,
            generic: m.generic || null,
            strength: m.strength || null,
            manufacturer: m.manufacturer || null,
            package_container: m.packSize || null,
            package_size: m.packageSize || null,
            stock: m.stock || 0,
            moq: m.moq || 1,
            price: m.wholesalePrice || m.price || 0
        }));

        const { data, error } = await supabase
            .from('medicines')
            .insert(values);

        if (error) throw error;
        res.status(201).json({ message: 'Medicines bulk imported successfully', count: values.length });
    } catch (error) {
        console.error('Bulk import failed:', error);
        res.status(500).json({ error: 'Failed to bulk import data' });
    }
});

// DELETE MULTIPLE MEDICINES
apiRouter.post('/medicines/delete', async (req, res) => {
    try {
        const { names } = req.body;
        if (!Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ error: 'No names provided for deletion' });
        }
        
        const { data, error } = await supabase
            .from('medicines')
            .delete()
            .in('brand_name', names);

        if (error) throw error;
        res.json({ message: 'Medicines deleted successfully' });
    } catch (error) {
        console.error('Failed to delete medicines:', error);
        res.status(500).json({ error: 'Failed to delete medicines' });
    }
});

// Mount the router on both base paths
app.use('/api', apiRouter);
app.use('/backend/api', apiRouter);

// Root routes to fix cPanel check availability errors
app.get('/', (req, res) => res.send('Backend is running!'));
app.get('/backend', (req, res) => res.send('Backend is running!'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
