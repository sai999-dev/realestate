// Backend server for Real Estate Portal API (serves both API and frontend)
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8000;

// Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables!');
  console.error('Please check your .env file contains:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Table name from environment variables
const TABLE_NAME = process.env.DATABASE_TABLE || 'property_inquiries';

// Middleware
// Configure CORS - in production, restrict to your domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || '*']
    : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (CSS, JS, images) from the current directory
app.use(express.static(path.join(__dirname)));

// API Documentation endpoint (at /api)
app.get('/api', (req, res) => {
  res.json({
    message: 'Real Estate Portal API Server',
    version: '1.0.0',
    endpoints: {
      'GET /api/inquiries': 'Get all property inquiries',
      'GET /api/inquiries/:id': 'Get a specific inquiry by ID',
      'POST /api/inquiries': 'Create a new property inquiry',
      'DELETE /api/inquiries/:id': 'Delete an inquiry by ID',
      'GET /api/schema': 'Get the data schema for property inquiries'
    }
  });
});

// GET schema endpoint - Returns the data structure
app.get('/api/schema', (req, res) => {
  try {
    const schema = {
      name: 'PropertyInquiry',
      description: 'Schema for property inquiry records',
      table: TABLE_NAME,
      fields: {
        id: {
          type: 'integer',
          description: 'Unique identifier for the inquiry record',
          required: false,
          auto_generated: true,
          primary_key: true
        },
        name: {
          type: 'string',
          description: 'Customer full name',
          required: true,
          max_length: 255,
          example: 'John Doe'
        },
        email: {
          type: 'string',
          description: 'Valid email address',
          required: true,
          format: 'email',
          example: 'john@example.com'
        },
        contact: {
          type: 'string',
          description: 'Phone number or contact information',
          required: false,
          max_length: 50,
          example: '+1234567890'
        },
        needs: {
          type: 'string',
          description: 'Detailed description of real estate requirements',
          required: true,
          example: 'Looking for a 3-bedroom apartment'
        },
        property_type: {
          type: 'string',
          description: 'Type of property needed',
          required: false,
          enum: ['Residential', 'Commercial', 'Industrial', 'Land'],
          example: 'Residential'
        },
        budget_range: {
          type: 'string',
          description: 'Price range preference',
          required: false,
          enum: ['Under $100K', '$100K-$500K', '$500K-$1M', '$1M+'],
          example: '$500K-$1M'
        },
        preferred_location: {
          type: 'string',
          description: 'Desired location or area',
          required: false,
          max_length: 255,
          example: 'Downtown Area'
        },
        timeline: {
          type: 'string',
          description: 'When the property is needed',
          required: false,
          enum: ['Immediate', '1-3 months', '3-6 months', '6+ months'],
          example: '1-3 months'
        },
        additional_details: {
          type: 'string',
          description: 'Extra requirements or preferences',
          required: false,
          example: 'Must have parking space'
        },
        industry: {
          type: 'string',
          description: 'Customer industry',
          required: false,
          enum: ['Home Health and Hospice', 'Finance', 'Insurance', 'Handyman Services'],
          example: 'Finance'
        },
        zipcode: {
          type: 'string',
          description: 'Customer zip code',
          required: false,
          max_length: 10,
          example: '12345'
        },
        submitted_at: {
          type: 'timestamp with time zone',
          description: 'ISO 8601 timestamp when inquiry was submitted',
          required: false,
          auto_generated: true,
          format: 'date-time',
          example: '2025-10-29T12:33:17.701047+00:00'
        }
      },
      required_fields: ['name', 'email', 'needs'],
      optional_fields: ['contact', 'property_type', 'budget_range', 'preferred_location', 'timeline', 'additional_details', 'industry', 'zipcode']
    };

    res.json({
      success: true,
      schema: schema
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET all property inquiries
app.get('/api/inquiries', async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching inquiries:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      count: count || data?.length || 0,
      data: data || []
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET a specific inquiry by ID
app.get('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Inquiry not found'
        });
      }
      console.error('Error fetching inquiry:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST - Create a new property inquiry
app.post('/api/inquiries', async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      needs,
      property_type,
      budget_range,
      preferred_location,
      timeline,
      additional_details,
      industry,
      zipcode
    } = req.body;

    // Validate required fields
    if (!name || !email || !contact || !needs) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, contact, and needs are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Prepare data for insertion
    const inquiryData = {
      name: name.trim(),
      email: email.trim(),
      contact: contact.trim(),
      needs: needs.trim(),
      property_type: property_type || null,
      budget_range: budget_range || null,
      preferred_location: preferred_location?.trim() || null,
      timeline: timeline || null,
      additional_details: additional_details?.trim() || null,
      industry: industry || null,
      zipcode: zipcode?.trim() || null
      // submitted_at will be automatically set by database (DEFAULT NOW())
    };

    // Insert into database
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([inquiryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating inquiry:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Property inquiry created successfully',
      data: data
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// DELETE - Delete an inquiry by ID
app.delete('/api/inquiries/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting inquiry:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Inquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully',
      data: data
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Serve frontend for all non-API routes (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real Estate Portal Server running on http://localhost:${PORT}`);
  console.log(`📊 Connected to Supabase: ${supabaseUrl}`);
  console.log(`📋 Table: ${TABLE_NAME}`);
  console.log('\n🌐 Frontend: http://localhost:' + PORT);
  console.log('📡 API Base: http://localhost:' + PORT + '/api');
  console.log('\nAvailable API endpoints:');
  console.log(`  GET    http://localhost:${PORT}/api/inquiries`);
  console.log(`  GET    http://localhost:${PORT}/api/inquiries/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/inquiries`);
  console.log(`  DELETE http://localhost:${PORT}/api/inquiries/:id`);
  console.log(`  GET    http://localhost:${PORT}/api/schema (Data schema)`);
  console.log(`  GET    http://localhost:${PORT}/api (API documentation)`);
});

