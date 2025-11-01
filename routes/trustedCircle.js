// ============================================================
// ✅ TRUSTED CIRCLE SECTION (load, add, remove contacts)
// ============================================================

async function loadTrustedContacts() {
  try {
    const response = await fetch(`${API_BASE_URL}/trusted-circle/USER_ID_HERE`); // replace USER_ID_HERE if user login implemented
    const data = await response.json();

    // 🔧 Ensure we always get an array
    const contacts = data.contacts || [];

    const list = document.getElementById('trustedContactsList');
    if (!list) return;
    list.innerHTML = '';

    if (contacts.length === 0) {
      list.innerHTML = `<p>No trusted contacts found.</p>`;
      return;
    }

    contacts.forEach(contact => {
      const div = document.createElement('div');
      div.classList.add('contact-item');
      div.innerHTML = `
        <p><strong>${contact.name}</strong> (${contact.relationship || 'N/A'})<br>
        ${contact.phone}</p>
        <button onclick="removeTrustedContact('${contact._id}')">Remove</button>
      `;
      list.appendChild(div);
    });
  } catch (error) {
    console.error('Error loading contacts:', error);
  }
}

async function addTrustedContact(event) {
  event.preventDefault();

  const nameInput = document.getElementById('contactName');
  const phoneInput = document.getElementById('contactPhone');
  const relationshipInput = document.getElementById('contactRelationship');

  // ✅ Prevent null errors
  if (!nameInput || !phoneInput) {
    alert('Form inputs missing. Please check contactName and contactPhone fields.');
    return;
  }

  const newContact = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    relationship: relationshipInput?.value || 'friend'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/trusted-circle/USER_ID_HERE/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact)
    });

    const data = await response.json();
    if (data.success) {
      alert('Contact added successfully!');
      loadTrustedContacts();
    } else {
      alert('Error: ' + (data.error || 'Failed to add contact'));
    }
  } catch (error) {
    console.error('Error adding contact:', error);
  }
}