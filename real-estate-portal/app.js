// ===============================
// 🏡 Real Estate Portal - Lead Form
// Integrated with Backend Webhook (Super Admin)
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Real Estate Portal Loaded');

  // Select form and message div
  const form = document.getElementById('customerForm');
  const messageDiv = document.getElementById('formMessage');

  if (!form) {
    console.error('❌ Form element not found (id="customerForm")');
    return;
  }

  // Webhook endpoint and API key (from your backend)
  const WEBHOOK_URL = 'https://super-admin-backend-2sy0.onrender.com/api/webhooks/webhooktesting';
  const API_KEY = 'prt_live_252e0393ecd6ea6e86a25f4170531b28';

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    // Gather form values
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('contact').value.trim(),
      property_type: document.getElementById('propertyType')?.value || null,
      budget_range: document.getElementById('budgetRange')?.value || null,
      city: document.getElementById('preferredLocation')?.value.trim() || null,
      timeline: document.getElementById('timeline')?.value || null,
      needs: document.getElementById('needs')?.value.trim() || null,
      additional_details: document.getElementById('additionalDetails')?.value.trim() || null,
      source: 'real_estate_portal'
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.needs) {
      showMessage('⚠️ Please fill in all required fields: Name, Email, Phone, and Requirements.', 'error');
      resetButton();
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage('⚠️ Please enter a valid email address.', 'error');
      resetButton();
      return;
    }

    // ✅ Send data to backend webhook
    try {
      console.log('📤 Sending form data to webhook:', formData);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('📦 Webhook Response:', result);

      if (response.ok && result.success) {
        showMessage('✅ Inquiry submitted successfully! Our team will contact you soon.', 'success');
        form.reset();
      } else {
        const errorMessage = result.message || '❌ Failed to submit inquiry.';
        showMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Network or server error:', error);
      showMessage('🚨 Unable to connect to backend. Please try again later.', 'error');
    } finally {
      resetButton();
    }

    // Restore button state
    function resetButton() {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  // Display success/error messages
  function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.display = 'block';
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 8000);
  }

  // Optional: basic navigation handling (if you have nav links)
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionName = link.dataset.section;
      navigateToSection(sectionName);
    });
  });

  // Navigation section visibility toggle
  function navigateToSection(sectionName) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    const target = document.getElementById(sectionName);
    if (target) target.classList.add('active');
  }

  console.log('🚀 Webhook integration ready.');
});
