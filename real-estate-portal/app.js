// Initialize Supabase client
const supabaseUrl = 'https://kteutayjbzmirzahxrsp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZXV0YXlqYnptaXJ6YWh4cnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MDc3MTMsImV4cCI6MjA3NjI4MzcxM30.2-U_qkNwMmHomoKtI1qGwVMCkdutTfMYzxGmIxmnePE';

// Create Supabase client (supabase is available globally from the CDN script)
// Access the global Supabase object - it should be loaded before this script
let supabase;
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error('❌ Supabase library not loaded! Make sure the Supabase script tag is loaded before app.js in index.html');
  // Create a fallback mock to prevent further errors
  supabase = {
    from: () => ({
      insert: () => ({ select: () => Promise.resolve({ data: null, error: { message: 'Supabase not loaded' } }) }),
      select: () => Promise.resolve({ data: null, error: { message: 'Supabase not loaded' } })
    })
  };
}

// Table name for customer inquiries (matches your Supabase table)
const CUSTOMERS_TABLE = 'property_inquiries';

// Data schema definition
const dataSchema = {
  name: "CustomerRecord",
  description: "Schema for customer real estate inquiry records",
  fields: {
    id: {
      type: "integer",
      description: "Unique identifier for the customer record",
      required: false,
      auto_generated: true
    },
    name: {
      type: "string",
      description: "Customer's full name",
      required: true,
      max_length: 255
    },
    email: {
      type: "string",
      description: "Valid email address for contact",
      required: true,
      format: "email"
    },
    contact: {
      type: "string",
      description: "Phone number for contact",
      required: true,
      format: "phone"
    },
    needs: {
      type: "string",
      description: "Detailed description of real estate requirements",
      required: true,
      max_length: 2000
    },
    property_type: {
      type: "string",
      description: "Type of property needed",
      required: false,
      enum: ["Residential", "Commercial", "Industrial", "Land"]
    },
    budget_range: {
      type: "string",
      description: "Price range preference",
      required: false,
      enum: ["Under $100K", "$100K-$500K", "$500K-$1M", "$1M+"]
    },
    preferred_location: {
      type: "string",
      description: "Desired location or area for the property",
      required: false,
      max_length: 255
    },
    timeline: {
      type: "string",
      description: "When the customer needs the property",
      required: false,
      enum: ["Immediate", "1-3 months", "3-6 months", "6+ months"]
    },
    additional_details: {
      type: "string",
      description: "Any additional requirements or preferences",
      required: false,
      max_length: 2000
    },
    submitted_at: {
      type: "string",
      description: "ISO 8601 timestamp of when the inquiry was submitted",
      required: false,
      auto_generated: true,
      format: "date-time"
    }
  }
};

// Navigation functionality
function navigateToSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Show target section
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Update nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.dataset.section === sectionName) {
      link.classList.add('active');
    }
  });
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle navigation clicks
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionName = this.dataset.section;
      navigateToSection(sectionName);
    });
  });
  
  // Initialize API examples
  updateAPIExamples().catch(err => {
    console.error('Error initializing API examples:', err);
  });
  
  // Test database connection after a short delay to ensure Supabase is loaded
  setTimeout(async () => {
    await testDatabaseConnection();
  }, 500);
});

// Form submission handler
const form = document.getElementById('customerForm');
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Disable submit button during submission
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Get form data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      contact: document.getElementById('contact').value.trim() || null,
      needs: document.getElementById('needs').value.trim(),
      property_type: document.getElementById('propertyType').value || null,
      budget_range: document.getElementById('budgetRange').value || null,
      preferred_location: document.getElementById('preferredLocation').value.trim() || null,
      timeline: document.getElementById('timeline').value || null,
      additional_details: document.getElementById('additionalDetails').value.trim() || null
      // Note: submitted_at is handled automatically by the database (DEFAULT NOW())
    };
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.contact || !formData.needs) {
      showMessage('Please fill in all required fields.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage('Please enter a valid email address.', 'error');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      return;
    }
    
    try {
      console.log('📤 Submitting form data to database...', formData);
      
      // Insert data into Supabase database (property_inquiries table)
      const { data, error } = await supabase
        .from(CUSTOMERS_TABLE)
        .insert([formData])
        .select(); // Returns the inserted row
      
      if (error) {
        console.error('❌ Database error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        // Show user-friendly error message
        let errorMessage = 'There was an error submitting your inquiry. ';
        if (error.code === '42501') {
          errorMessage += 'Permission denied. Please check Row Level Security policies.';
        } else if (error.code === 'PGRST116') {
          errorMessage += 'Table not found. Please check database setup.';
        } else {
          errorMessage += 'Please try again later.';
        }
        
        showMessage(errorMessage, 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
      }
      
      // Success! Data saved to database
      console.log('✅ Data successfully saved to database!', data);
      console.log('📋 Saved record:', data[0]);
      
      // Verify the record was saved by checking all records
      setTimeout(async () => {
        console.log('\n🔍 Verifying record in database...');
        await checkAllRecords();
      }, 500);
      
      // Show success message
      showMessage('Thank you! Your inquiry has been submitted successfully and saved to the database. Our team will contact you soon.', 'success');
      
      // Reset form
      form.reset();
      
      // Update API examples to show the new data
      await updateAPIExamples();
      
      // Scroll to message
      document.getElementById('formMessage').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      showMessage('An unexpected error occurred. Please try again later.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Show form message
function showMessage(message, type) {
  const messageDiv = document.getElementById('formMessage');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide after 8 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 8000);
  }
}

// API endpoint functions - fetch from Supabase
async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching customers:', error);
      return {
        success: false,
        error: error.message,
        count: 0,
        data: []
      };
    }
    
    return {
      success: true,
      count: data?.length || 0,
      data: data || []
    };
  } catch (err) {
    console.error('Unexpected error fetching customers:', err);
    return {
      success: false,
      error: err.message,
      count: 0,
      data: []
    };
  }
}

function getSchema() {
  return {
    success: true,
    schema: dataSchema
  };
}

// Update API examples in the documentation
async function updateAPIExamples() {
  const customersExample = document.getElementById('customersExample');
  if (customersExample) {
    try {
      const customersData = await getCustomers();
      customersExample.textContent = JSON.stringify(customersData, null, 2);
    } catch (err) {
      customersExample.textContent = JSON.stringify({ 
        success: false, 
        error: 'Failed to load customer data' 
      }, null, 2);
    }
  }
  
  const schemaExample = document.getElementById('schemaExample');
  if (schemaExample) {
    schemaExample.textContent = JSON.stringify(getSchema(), null, 2);
  }
}

// Test endpoint functionality
async function testEndpoint(endpoint) {
  let result;
  
  if (endpoint === 'customers') {
    result = await getCustomers();
  } else if (endpoint === 'schema') {
    result = getSchema();
  }
  
  // Create a modal-like alert with the result
  const message = `API Response:\n\n${JSON.stringify(result, null, 2)}`;
  alert(message);
  
  // Also log to console for developers
  console.log(`API Endpoint: /api/${endpoint}`);
  console.log('Response:', result);
}

// Test database connection
async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Try to fetch data (will fail if table doesn't exist)
    console.log('📊 Testing table access...');
    const { data, error, count } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.error('❌ TABLE NOT FOUND: The "property_inquiries" table does not exist in your database.');
        console.log('📝 SOLUTION: Make sure the table exists in your Supabase database');
        return {
          connected: false,
          tableExists: false,
          error: 'Table does not exist. Please check your Supabase database.'
        };
      } else {
        console.error('❌ ERROR:', error.message);
        return {
          connected: false,
          tableExists: false,
          error: error.message
        };
      }
    }
    
    console.log('✅ Connection successful!');
    console.log('✅ Table exists and is accessible');
    console.log(`📈 Current record count: ${count || 0}`);
    
    return {
      connected: true,
      tableExists: true,
      recordCount: count || 0
    };
  } catch (err) {
    console.error('❌ CONNECTION ERROR:', err);
    return {
      connected: false,
      tableExists: false,
      error: err.message
    };
  }
}

// Helper function to check all records in database
async function checkAllRecords() {
  console.log('🔍 Fetching all records from database...');
  try {
    const { data, error, count } = await supabase
      .from(CUSTOMERS_TABLE)
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching records:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ Found ${count || data?.length || 0} record(s) in database:`);
    console.table(data || []);
    
    return {
      success: true,
      count: count || data?.length || 0,
      records: data || []
    };
  } catch (err) {
    console.error('❌ Error:', err);
    return { success: false, error: err.message };
  }
}

// Make functions globally available
window.navigateToSection = navigateToSection;
window.testEndpoint = testEndpoint;
window.getCustomers = getCustomers;
window.getSchema = getSchema;
window.testDatabaseConnection = testDatabaseConnection;
window.checkAllRecords = checkAllRecords;

// Log API info on page load
console.log('=== Real Estate Portal API ===');
console.log('Available endpoints:');
console.log('1. getCustomers() - Returns all customer data');
console.log('2. getSchema() - Returns data schema');
console.log('3. testDatabaseConnection() - Test database connection');
console.log('\nYou can call these functions directly in the console.');
console.log('Example: getCustomers() or testDatabaseConnection()');