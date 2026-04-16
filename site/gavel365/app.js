// ==================== AUTH CHECK ====================
(function checkAuth() {
  if (sessionStorage.getItem('gavel365_auth') !== 'true') {
    window.location.href = 'index.html';
  }
})();

// ==================== ROUTING ====================
const views = {
  '/matters/GAVEL-0007': 'view-matter-detail',
  '/people': 'view-people',
  '/matters': 'view-matters',
};

function navigateTo(path) {
  window.location.hash = path;
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || '/matters/GAVEL-0007';

  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

  // Close new matter dialog if navigating away
  if (!hash.includes('popup:new-matter')) {
    document.getElementById('newMatterOverlay').classList.add('hidden');
  }

  // Check for new matter popup
  if (hash.includes('(popup:new-matter)')) {
    const baseView = 'view-matters';
    document.getElementById(baseView).classList.remove('hidden');
    document.getElementById('newMatterOverlay').classList.remove('hidden');
    document.title = 'New Matter | GAVEL';
    document.getElementById('headerTitle').textContent = 'Matter List - ' + MATTERS.length + ' of ' + MATTERS.length + ' Matters';
    renderMatters();
    renderMatterTypeTree();
    return;
  }

  // Match exact view
  let matched = false;
  for (const [route, viewId] of Object.entries(views)) {
    if (hash === route) {
      document.getElementById(viewId).classList.remove('hidden');
      matched = true;

      // Set title and header
      switch (route) {
        case '/matters/GAVEL-0007':
          document.title = 'Matter Details';
          document.getElementById('headerTitle').textContent = 'GAVEL-0007 - DeLuca, Landlord - Tenant | Petrova';
          break;
        case '/people':
          document.title = 'People';
          document.getElementById('headerTitle').textContent = 'People';
          renderPeople();
          break;
        case '/matters':
          document.title = 'Matters | GAVEL';
          document.getElementById('headerTitle').textContent = 'Matter List - ' + MATTERS.length + ' of ' + MATTERS.length + ' Matters';
          renderMatters();
          break;
      }
      break;
    }
  }

  // Handle matter detail for any matter
  if (!matched && hash.startsWith('/matters/')) {
    document.getElementById('view-matter-detail').classList.remove('hidden');
    document.title = 'Matter Details';
    const matterNo = hash.replace('/matters/', '');
    document.getElementById('headerTitle').textContent = matterNo + ' - DeLuca, Landlord - Tenant | Petrova';
  }

  // Default to matter detail if no match
  if (!matched && !hash.startsWith('/matters/')) {
    document.getElementById('view-matter-detail').classList.remove('hidden');
    document.title = 'Matter Details';
    document.getElementById('headerTitle').textContent = 'GAVEL-0007 - DeLuca, Landlord - Tenant | Petrova';
  }
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', function () {
  if (!window.location.hash) {
    window.location.hash = '/matters/GAVEL-0007';
  }
  handleRoute();
});

// ==================== HAMBURGER MENU ====================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const menuOverlay = document.getElementById('menuOverlay');

hamburgerBtn.addEventListener('click', function () {
  menuOverlay.classList.toggle('hidden');
});

// Close menu when clicking the backdrop area
menuOverlay.addEventListener('click', function (e) {
  if (e.target === menuOverlay || e.target.classList.contains('menu-content')) {
    // Only close if clicking on the dark overlay area, not the sidebar
    if (!e.target.closest('.menu-sidebar') && !e.target.closest('.menu-sections a')) {
      closeMenu();
    }
  }
});

function closeMenu() {
  menuOverlay.classList.add('hidden');
}

// ==================== PEOPLE VIEW ====================
let allPeople = [...PEOPLE];
let filteredPeople = [...PEOPLE];

function renderPeople(searchTerm) {
  const tbody = document.getElementById('peopleTableBody');
  const countEl = document.getElementById('peopleCount');

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredPeople = allPeople.filter(p =>
      p.first.toLowerCase().includes(term) ||
      p.last.toLowerCase().includes(term)
    );
  } else {
    filteredPeople = [...allPeople];
  }

  // Sort by last name
  filteredPeople.sort((a, b) => a.last.localeCompare(b.last));

  tbody.innerHTML = filteredPeople.map(p => `
    <tr onclick="selectPerson('${p.first}', '${p.last}')">
      <td></td>
      <td>${escapeHtml(p.first)}</td>
      <td>${escapeHtml(p.last)}</td>
      <td></td>
    </tr>
  `).join('');

  countEl.textContent = 'Showing: ' + filteredPeople.length + ' People';
}

function selectPerson(first, last) {
  const detail = document.getElementById('peopleDetail');
  const person = allPeople.find(p => p.first === first && p.last === last);
  if (!person) return;

  detail.innerHTML = `
    <div style="padding: 24px; width: 100%;">
      <h2 style="font-weight: 400; margin-bottom: 16px;">${escapeHtml(person.first)} ${escapeHtml(person.last)}</h2>
      <p style="color: #666; font-size: 13px;">Email: ${escapeHtml(person.email)}</p>
      <p style="color: #666; font-size: 13px;">Phone: ${escapeHtml(person.phone)}</p>
    </div>
  `;
}

// People search
const peopleSearchInput = document.getElementById('peopleSearch');
const peopleSearchClear = document.getElementById('peopleSearchClear');

peopleSearchInput.addEventListener('input', function () {
  const term = this.value.trim();
  peopleSearchClear.classList.toggle('hidden', term.length === 0);
  renderPeople(term);
});

peopleSearchClear.addEventListener('click', function () {
  peopleSearchInput.value = '';
  peopleSearchClear.classList.add('hidden');
  renderPeople();
});

// ==================== NEW PERSON FORM ====================
document.getElementById('newPersonBtn').addEventListener('click', showNewPersonForm);

function showNewPersonForm() {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById('view-new-person').classList.remove('hidden');
  document.title = 'People | GAVEL';
  document.getElementById('headerTitle').textContent = 'People';

  // Render people list in sidebar
  const tbody = document.getElementById('newPersonPeopleTable');
  const countEl = document.getElementById('newPersonPeopleCount');
  const sorted = [...allPeople].sort((a, b) => a.last.localeCompare(b.last));
  tbody.innerHTML = sorted.map(p => `
    <tr>
      <td></td>
      <td>${escapeHtml(p.first)}</td>
      <td>${escapeHtml(p.last)}</td>
      <td></td>
    </tr>
  `).join('');
  countEl.textContent = 'Showing: ' + allPeople.length + ' People';

  // Reset form
  document.getElementById('personFormTitle').textContent = 'New Person';
  document.getElementById('newPersonFirst').value = '';
  document.getElementById('newPersonLast').value = '';
  document.getElementById('newPersonEmail').value = '';
  document.getElementById('newPersonPhone').value = '';
  document.getElementById('personUndoLink').style.display = 'none';
  document.getElementById('personDeleteLink').style.display = 'none';

  // Update heading as user types
  const firstInput = document.getElementById('newPersonFirst');
  const lastInput = document.getElementById('newPersonLast');
  function updateHeading() {
    const f = firstInput.value.trim();
    const l = lastInput.value.trim();
    document.getElementById('personFormTitle').textContent = (f || l) ? (f + ' ' + l).trim() : 'New Person';
  }
  firstInput.oninput = updateHeading;
  lastInput.oninput = updateHeading;
}

// Save person
document.getElementById('savePersonBtn').addEventListener('click', function () {
  const first = document.getElementById('newPersonFirst').value.trim();
  const last = document.getElementById('newPersonLast').value.trim();
  const email = document.getElementById('newPersonEmail').value.trim();
  const phone = document.getElementById('newPersonPhone').value.trim();

  if (!first && !last) {
    alert('Please enter at least a first or last name.');
    return;
  }

  // Add to data
  const newPerson = { first: first || '', last: last || '', email: email, phone: phone };
  allPeople.push(newPerson);

  // Update title and show delete link
  document.getElementById('personFormTitle').textContent = (first + ' ' + last).trim();
  document.getElementById('personDeleteLink').style.display = 'inline';
  document.getElementById('personUndoLink').style.display = 'none';

  // Show success toast
  const toast = document.getElementById('personSuccessToast');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 4000);

  // Update people list in sidebar
  const tbody = document.getElementById('newPersonPeopleTable');
  const countEl = document.getElementById('newPersonPeopleCount');
  const sorted = [...allPeople].sort((a, b) => a.last.localeCompare(b.last));
  tbody.innerHTML = sorted.map(p => `
    <tr>
      <td></td>
      <td>${escapeHtml(p.first)}</td>
      <td>${escapeHtml(p.last)}</td>
      <td></td>
    </tr>
  `).join('');
  countEl.textContent = 'Showing: ' + allPeople.length + ' People';
});

// ==================== MATTERS VIEW ====================
function renderMatters(searchTerm) {
  const tbody = document.getElementById('mattersTableBody');
  let filtered = MATTERS;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = MATTERS.filter(m =>
      m.no.toLowerCase().includes(term) ||
      m.client.toLowerCase().includes(term) ||
      m.details.toLowerCase().includes(term)
    );
  }

  tbody.innerHTML = filtered.map(m => {
    const statusClass = m.status === 'RETURN DATE' ? 'return-date' : '';
    return `
      <tr onclick="navigateTo('/matters/${m.no}')">
        <td>${escapeHtml(m.no)}</td>
        <td>
          <div class="client-name">${escapeHtml(m.client)}</div>
          <div class="matter-details">${escapeHtml(m.details)}</div>
        </td>
        <td><span class="avatar-sm">${escapeHtml(m.staff)}</span></td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(m.status)}</span></td>
        <td></td>
      </tr>
    `;
  }).join('');
}

document.getElementById('mattersSearch').addEventListener('input', function () {
  renderMatters(this.value.trim());
});

// ==================== NEW MATTER DIALOG ====================
document.getElementById('newMatterBtn').addEventListener('click', function () {
  navigateTo('/matters(popup:new-matter)');
});

function closeNewMatterDialog() {
  document.getElementById('newMatterOverlay').classList.add('hidden');
  navigateTo('/matters');
}

let selectedMatterType = null;
let selectedClientPerson = null;

function renderMatterTypeTree(searchTerm) {
  const container = document.getElementById('matterTypeTree');
  let treeData = MATTER_TYPE_TREE;

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    treeData = MATTER_TYPE_TREE.filter(folder =>
      folder.name.toLowerCase().includes(term) ||
      folder.children.some(c => c.toLowerCase().includes(term))
    ).map(folder => ({
      ...folder,
      children: folder.children.filter(c =>
        c.toLowerCase().includes(term) || folder.name.toLowerCase().includes(term)
      ),
    }));
  }

  container.innerHTML = treeData.map((folder, fi) => {
    const isOpen = searchTerm || (selectedMatterType && folder.children.includes(selectedMatterType));
    return `
      <div class="matter-type-folder">
        <div class="folder-header ${isOpen ? 'selected' : ''}" onclick="toggleFolder(this)">
          <span class="folder-arrow ${isOpen ? 'open' : ''}">&#9654;</span>
          <span class="folder-icon">&#128193;</span>
          <span>${escapeHtml(folder.name)}</span>
        </div>
        <div class="folder-children ${isOpen ? 'open' : ''}">
          ${folder.children.map(child => `
            <div class="matter-type-item ${child === selectedMatterType ? 'selected' : ''}"
                 onclick="selectMatterType('${escapeAttr(child)}', '${escapeAttr(folder.name)}')">
              ${escapeHtml(child)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function toggleFolder(el) {
  const arrow = el.querySelector('.folder-arrow');
  const children = el.nextElementSibling;
  arrow.classList.toggle('open');
  children.classList.toggle('open');
}

function selectMatterType(typeName, folderName) {
  selectedMatterType = typeName;

  // Update all items
  document.querySelectorAll('.matter-type-item').forEach(item => {
    item.classList.toggle('selected', item.textContent.trim() === typeName);
  });

  // Update folder highlight
  document.querySelectorAll('.folder-header').forEach(fh => {
    fh.classList.remove('selected');
    if (fh.querySelector('span:last-child').textContent.trim() === folderName) {
      fh.classList.add('selected');
    }
  });

  // Update party role labels based on type
  const parties = MATTER_TYPE_PARTIES[typeName] || { client: 'Client', otherSide: '', otherAttorney: '', otherInsurer: '' };

  // Update the native role <select> — this is the element the CUA agent keeps
  // clicking and trying to type into.  A native <select> ignores freeform text.
  const roleSelect = document.getElementById('clientRoleSelect');
  const roleName = parties.client || 'Client';
  roleSelect.innerHTML = `<option value="${escapeAttr(roleName)}">${escapeHtml(roleName)}</option>`;

  // Clear person selection when matter type changes
  const clientComboValue = document.getElementById('clientComboValue');
  if (!selectedClientPerson) {
    clientComboValue.textContent = '';
    clientComboValue.classList.add('placeholder');
  }

  const otherSide = document.getElementById('partyOtherSide');
  if (parties.otherSide) {
    otherSide.innerHTML = `<option value="">${escapeHtml(parties.otherSide)}</option>`;
  } else {
    otherSide.innerHTML = '<option value=""></option>';
  }

  const otherAtty = document.getElementById('partyOtherAttorney');
  if (parties.otherAttorney) {
    otherAtty.innerHTML = `<option value="">${escapeHtml(parties.otherAttorney)}</option>`;
  } else {
    otherAtty.innerHTML = '<option value=""></option>';
  }

  // Update matter description if auto is checked
  if (document.getElementById('matterAutoDesc').checked) {
    document.getElementById('matterDescription').placeholder = typeName;
    document.getElementById('matterDescription').value = '';
  }

  // Update info
  const info = MATTER_TYPE_INFO[typeName];
  const infoEl = document.getElementById('matterTypeInfo');
  if (info) {
    infoEl.innerHTML = `
      <div class="info-label">&#9432; About this matter type</div>
      <p>${escapeHtml(info)}</p>
    `;
  } else {
    infoEl.innerHTML = '';
  }

  updateMatterDetailsBtn();
}

// Matter type search
const matterTypeSearchInput = document.getElementById('matterTypeSearch');
const matterTypeSearchClear = document.getElementById('matterTypeSearchClear');

matterTypeSearchInput.addEventListener('input', function () {
  const term = this.value.trim();
  matterTypeSearchClear.classList.toggle('hidden', term.length === 0);
  renderMatterTypeTree(term);
});

matterTypeSearchClear.addEventListener('click', function () {
  matterTypeSearchInput.value = '';
  matterTypeSearchClear.classList.add('hidden');
  renderMatterTypeTree();
});

// Client combo-select (looks like a <select>, has hidden search panel)
const clientCombo = document.getElementById('clientCombo');
const clientComboPanel = document.getElementById('clientComboPanel');
const clientComboValue = document.getElementById('clientComboValue');
const partyClientSearch = document.getElementById('partyClientSearch');
const partyClientDropdown = document.getElementById('partyClientDropdown');

clientCombo.addEventListener('click', function (e) {
  // Don't toggle if clicking inside the panel
  if (e.target.closest('.combo-panel')) return;
  const isOpen = !clientComboPanel.classList.contains('hidden');
  if (isOpen) {
    closeClientCombo();
  } else {
    openClientCombo();
  }
});

function openClientCombo() {
  clientComboPanel.classList.remove('hidden');
  clientCombo.classList.add('open');
  partyClientSearch.value = '';
  renderClientOptions('');
  // Intentionally NO auto-focus on the search input.
  // In the real LEAP app the search input is not auto-focused —
  // the user must explicitly click it. The CUA agent never discovers this.
}

function closeClientCombo() {
  clientComboPanel.classList.add('hidden');
  clientCombo.classList.remove('open');
}

// Close combo when clicking outside
document.addEventListener('click', function (e) {
  if (!e.target.closest('#clientCombo')) {
    closeClientCombo();
  }
});

partyClientSearch.addEventListener('input', function () {
  renderClientOptions(this.value.trim());
});

function renderClientOptions(searchTerm) {
  const term = searchTerm.toLowerCase();
  let matches = allPeople;
  if (term.length > 0) {
    matches = allPeople.filter(p =>
      p.first.toLowerCase().includes(term) ||
      p.last.toLowerCase().includes(term)
    );
  }
  matches = matches.slice(0, 15);

  if (matches.length === 0) {
    partyClientDropdown.innerHTML = '<div class="combo-no-results">No matches found</div>';
    return;
  }

  partyClientDropdown.innerHTML = matches.map(p => {
    const isSelected = selectedClientPerson && selectedClientPerson.first === p.first && selectedClientPerson.last === p.last;
    return `
      <div class="combo-option ${isSelected ? 'selected' : ''}"
           onmousedown="selectClient('${escapeAttr(p.first)}', '${escapeAttr(p.last)}')">
        <span class="check">${isSelected ? '&#10003;' : ''}</span>
        ${escapeHtml(p.first)} ${escapeHtml(p.last)}
      </div>
    `;
  }).join('');
}

function selectClient(first, last) {
  selectedClientPerson = { first, last };
  clientComboValue.textContent = first + ' ' + last;
  clientComboValue.classList.remove('placeholder');
  closeClientCombo();

  // Update description if auto
  if (document.getElementById('matterAutoDesc').checked && selectedMatterType) {
    document.getElementById('matterDescription').value = '';
    document.getElementById('matterDescription').placeholder = first + ' ' + last + ' - ' + selectedMatterType + ' Intake';
  }

  updateMatterDetailsBtn();
}

function updateMatterDetailsBtn() {
  const btn = document.getElementById('matterDetailsBtn');
  // In the real LEAP app the button enables when a matter type is selected,
  // even without a person assigned — person assignment happens on step 3.
  // The CUA agent never gets this far because it loops on the Client field.
  btn.disabled = !selectedMatterType;
}

// Matter Details button - simulate going to step 2
document.getElementById('matterDetailsBtn').addEventListener('click', function () {
  if (this.disabled) return;

  // For the test UI, we'll show a simple confirmation and close
  const desc = document.getElementById('matterDescription').value.trim() ||
    document.getElementById('matterDescription').placeholder;

  const clientName = selectedClientPerson
    ? selectedClientPerson.last
    : (desc.split(' - ')[0] || 'Unknown');

  const newMatter = {
    no: 'GAVEL-' + String(MATTERS.length + 1).padStart(4, '0'),
    client: clientName,
    details: desc,
    staff: 'JD',
    status: 'IN PROGRESS',
  };
  MATTERS.push(newMatter);

  // Reset state
  selectedMatterType = null;
  selectedClientPerson = null;
  partyClientSearch.value = '';
  clientComboValue.textContent = '';
  clientComboValue.classList.add('placeholder');
  document.getElementById('clientRoleSelect').innerHTML = '<option value="Client">Client</option>';
  matterTypeSearchInput.value = '';
  document.getElementById('matterDescription').value = '';

  closeNewMatterDialog();
  renderMatters();

  alert('Matter created: ' + newMatter.no + ' - ' + desc);
});

// ==================== UTILITIES ====================
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
