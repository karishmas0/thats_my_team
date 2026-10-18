'use strict';

const themeStylesheet = document.querySelector('#theme-stylesheet');
const themeToggle = document.querySelector('#theme-toggle');
const themeToggleLabel = themeToggle.querySelector('.theme-toggle-label');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle-icon');
const authCard = document.querySelector('#auth-card');
const athleteDashboard = document.querySelector('#athlete-dashboard');
const authStatus = document.querySelector('#auth-status');
const loginForm = document.querySelector('#login-form');
const forgotPasswordButton = document.querySelector('#forgot-password-button');
const adminTabs = document.querySelector('#admin-tabs');
const addProfileButton = document.querySelector('#add-profile-button');
const signupForm = document.querySelector('#signup-form');
const authModeToggle = document.querySelector('#auth-mode-toggle');
const loginModeToggle = document.querySelector('#login-mode-toggle');
const membershipPending = document.querySelector('#membership-pending');
const athleteForm = document.querySelector('#athlete-form');
const athleteList = document.querySelector('#athlete-list');
const profilesPagination = document.querySelector('#profiles-pagination');
const personalBestSection = document.querySelector('#personal-bests');
const personalBestForm = document.querySelector('#personal-best-form');
const personalBestFormStatus = document.querySelector('#personal-best-form-status');
const personalBestSubmitLabel = document.querySelector('.personal-best-submit-label');
const cancelPersonalBestEdit = document.querySelector('#cancel-personal-best-edit');
const myPersonalBestList = document.querySelector('#my-personal-best-list');
const myPersonalBestPagination = document.querySelector('#my-personal-best-pagination');
const myPersonalBestCount = document.querySelector('#my-personal-best-count');
const myPersonalBestsStatus = document.querySelector('#my-personal-bests-status');
const personalBestSharingToggle = document.querySelector('#personal-best-sharing-toggle');
const personalBestSharingStatus = document.querySelector('#personal-best-sharing-status');
const teamPersonalBestList = document.querySelector('#team-personal-best-list');
const teamPersonalBestPagination = document.querySelector('#team-personal-best-pagination');
const teamPersonalBestsStatus = document.querySelector('#team-personal-bests-status');
const personalBestAdmin = document.querySelector('#personal-best-admin');
const personalBestAdminList = document.querySelector('#personal-best-admin-list');
const personalBestAdminPagination = document.querySelector('#personal-best-admin-pagination');
const personalBestAdminStatus = document.querySelector('#personal-best-admin-status');
const formStatus = document.querySelector('#form-status');
const directoryStatus = document.querySelector('#directory-status');
const directoryCount = document.querySelector('#directory-count');
const cancelEditButton = document.querySelector('#cancel-edit-button');
const membershipAdmin = document.querySelector('#membership-admin');
const membershipRequestList = document.querySelector('#membership-request-list');
const membershipPagination = document.querySelector('#membership-pagination');
const membershipRequestCount = document.querySelector('#membership-request-count');
const membershipStatus = document.querySelector('#membership-status');
const profileEditor = document.querySelector('#profile-editor');
const adminDashboardLink = document.querySelector('#admin-dashboard-link');
const recordAdmin = document.querySelector('#record-admin');
const recordForms = new Map([...document.querySelectorAll('[data-record-form]')].map(form => [form.dataset.recordForm, form]));
const addRecordButtons = new Map([...document.querySelectorAll('[data-add-record]')].map(button => [button.dataset.addRecord, button]));
const recordCategoryTabs = document.querySelector('#record-category-tabs');
const recordCategoryPanels = new Map([...document.querySelectorAll('[data-record-panel]')].map(panel => [panel.dataset.recordPanel, panel]));
const recordFormFieldsTemplate = document.querySelector('#record-form-fields-template');
const adminRecordLists = new Map([...document.querySelectorAll('[data-record-list]')].map(list => [list.dataset.recordList, list]));
const recordListStatuses = new Map([...document.querySelectorAll('[data-record-list-status]')].map(status => [status.dataset.recordListStatus, status]));
const recordListPaginations = new Map([...document.querySelectorAll('[data-record-pagination]')].map(nav => [nav.dataset.recordPagination, nav]));
const recordsStatus = document.querySelector('#records-status');
const refreshAdminRecordsButton = document.querySelector('#refresh-admin-records-button');
const refreshRecordsButton = document.querySelector('#refresh-records-button');
const refreshPersonalBestsButton = document.querySelector('#refresh-personal-bests');
const refreshPersonalBestAdminButton = document.querySelector('#refresh-personal-best-admin');
const profileRecordMenu = document.querySelector('#profile-record-menu');
const profileRecordMenuOptions = document.querySelector('#profile-record-menu-options');
const profileRecordSelected = document.querySelector('#profile-record-selected');
const profileRecordRows = document.querySelector('#profile-record-rows');
const profileBoysTab = document.querySelector('#profile-boys-tab');
const profileGirlsTab = document.querySelector('#profile-girls-tab');
const RECORD_CATEGORIES = {
  inter_iit: 'Inter-IIT Records',
  institute: 'Institute Records',
  trials: 'Trials Timings',
  sportsfest: 'Sportsfest Timings',
  summer_trials: 'Summer Trials Timings',
  sangram: 'Sangram',
};
const isAdminPage = document.body.dataset.page === 'admin';
let profileRecords = [];
const savedRecordType = localStorage.getItem('athletics-record-type');
let selectedRecordType = savedRecordType && /^[a-z][a-z0-9_]{1,39}$/.test(savedRecordType)
  ? savedRecordType
  : 'inter_iit';
let selectedRecordTeam = localStorage.getItem('athletics-record-team') === 'girls' ? 'girls' : 'boys';
let currentRole = '';
let currentUserId = '';
let currentUserName = '';
let sessionBeingHandled = '';
let personalBestSharingChannel = null;
let personalBestSharingReloadTimer = 0;
const personalBestSharingByOwner = new Map();
const listPages = new Map();
const LIST_PAGE_SIZE = 10;
let savedAdminRecords = [];
let renderAdminRecord = null;
let selectedAdminRecordCategory = 'inter_iit';
const selectedAdminRecordTeams = new Map([
  ['inter_iit', 'boys'],
  ['institute', 'boys'],
  ['other', 'boys'],
]);
const isCoreRecordType = recordType => recordType === 'inter_iit' || recordType === 'institute';

if (recordFormFieldsTemplate) {
  for (const [category, form] of recordForms) {
    if (category !== 'other') {
      form.querySelector('[data-record-fields]').replaceChildren(recordFormFieldsTemplate.content.cloneNode(true));
    }
  }
}

function setTheme(theme) {
  const isLight = theme === 'light';
  themeStylesheet.href = isLight ? '../assets/css/light-theme.css' : '../assets/css/dark-theme.css';
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggleLabel.textContent = isLight ? 'Dark mode' : 'Light mode';
  themeToggleIcon.textContent = isLight ? '☾' : '☼';
  document.querySelector('meta[name="theme-color"]').content = isLight ? '#f4f1ec' : '#101010';
  localStorage.setItem('athletics-theme', theme);
}

setTheme(localStorage.getItem('athletics-theme') === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
document.querySelector('#year').textContent = new Date().getFullYear();

profileRecordMenu?.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  profileRecordMenu.open = false;
  profileRecordMenu.querySelector('summary').focus();
});
document.addEventListener('pointerdown', event => {
  if (profileRecordMenu && !profileRecordMenu.contains(event.target)) profileRecordMenu.open = false;
});

for (const [category, form] of recordForms) {
  if (category !== 'other') continue;
  const categoryInput = form.elements.namedItem('record_type');
  const customField = form.querySelector('[data-custom-record-type-field]');
  const customInput = form.elements.namedItem('custom_record_type');
  customField.hidden = true;
  categoryInput.addEventListener('change', () => {
    const isCustom = categoryInput.value === 'custom';
    customField.hidden = !isCustom;
    customInput.required = isCustom;
    if (isCustom) customInput.focus();
  });
}

function setStatus(element, message, state = '') {
  element.textContent = message;
  element.dataset.state = state;
}

function renderPaginatedList(container, pagination, items, renderItem, listKey) {
  if (!container) return;
  const pageCount = Math.max(1, Math.ceil(items.length / LIST_PAGE_SIZE));
  const page = Math.min(listPages.get(listKey) ?? 1, pageCount);
  listPages.set(listKey, page);
  const start = (page - 1) * LIST_PAGE_SIZE;
  container.replaceChildren(...items.slice(start, start + LIST_PAGE_SIZE).map(renderItem));
  if (!pagination) return;

  pagination.replaceChildren();
  pagination.hidden = pageCount <= 1;
  if (pagination.hidden) return;

  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = 'Previous';
  previous.disabled = page === 1;
  previous.addEventListener('click', () => {
    listPages.set(listKey, page - 1);
    renderPaginatedList(container, pagination, items, renderItem, listKey);
  });
  const pageStatus = document.createElement('span');
  pageStatus.textContent = `Page ${page} of ${pageCount}`;
  pageStatus.setAttribute('aria-live', 'polite');
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  next.disabled = page === pageCount;
  next.addEventListener('click', () => {
    listPages.set(listKey, page + 1);
    renderPaginatedList(container, pagination, items, renderItem, listKey);
  });
  pagination.append(previous, pageStatus, next);
}

function renderAdminRecordLists() {
  if (!renderAdminRecord) return;
  for (const category of recordCategoryPanels.keys()) {
    const team = selectedAdminRecordTeams.get(category) ?? 'boys';
    const records = savedAdminRecords.filter(record =>
      (category === 'other' ? !isCoreRecordType(record.record_type) : record.record_type === category)
      && record.team === team);
    const list = adminRecordLists.get(category);
    const pagination = recordListPaginations.get(category);
    renderPaginatedList(list, pagination, records, renderAdminRecord, `records:${category}:${team}`);
    const status = recordListStatuses.get(category);
    if (status && records.length === 0) {
      const categoryName = category === 'other' ? 'other-category' : (RECORD_CATEGORIES[category] ?? category);
      setStatus(status, `No ${team} ${categoryName} records yet.`);
    } else if (status) {
      setStatus(status, '');
    }
  }
}

function initializeAdminTabs() {
  if (!adminTabs) return;
  const tabs = [...adminTabs.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (tabs.length === 0 || panels.some(panel => !panel)) return;

  function activateTab(index, moveFocus = false) {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[tabIndex].hidden = !active;
    });
    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(index));
    tab.addEventListener('keydown', event => {
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(nextIndex, true);
    });
  });
  activateTab(Math.max(0, tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true')));
}

initializeAdminTabs();

function initializeAdminRecordFilters() {
  if (!recordCategoryTabs || recordCategoryPanels.size === 0) return;

  function activateCategory(category, moveFocus = false) {
    selectedAdminRecordCategory = category;
    for (const tab of recordCategoryTabs.querySelectorAll('[role="tab"]')) {
      const active = tab.dataset.recordCategory === category;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = recordCategoryPanels.get(tab.dataset.recordCategory);
      if (panel) panel.hidden = !active;
      if (active && moveFocus) tab.focus();
    }
    renderAdminRecordLists();
  }

  for (const tab of recordCategoryTabs.querySelectorAll('[role="tab"]')) {
    tab.addEventListener('click', () => activateCategory(tab.dataset.recordCategory));
    tab.addEventListener('keydown', event => {
      const categoryTabs = [...recordCategoryTabs.querySelectorAll('[role="tab"]')];
      const index = categoryTabs.indexOf(tab);
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % categoryTabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + categoryTabs.length) % categoryTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = categoryTabs.length - 1;
      else return;
      event.preventDefault();
      activateCategory(categoryTabs[nextIndex].dataset.recordCategory, true);
    });
  }

  for (const panel of recordCategoryPanels.values()) {
    for (const teamTab of panel.querySelectorAll('[data-record-team]')) {
      teamTab.addEventListener('click', () => {
        const category = panel.dataset.recordPanel;
        selectedAdminRecordTeams.set(category, teamTab.dataset.recordTeam);
        updateRecordTeamTabs(panel);
        renderAdminRecordLists();
      });
      teamTab.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const nextTeam = teamTab.dataset.recordTeam === 'boys' ? 'girls' : 'boys';
        const nextTab = panel.querySelector(`[data-record-team="${nextTeam}"]`);
        nextTab.click();
        nextTab.focus();
      });
    }
  }

  activateCategory(selectedAdminRecordCategory);
}

function updateRecordTeamTabs(panel) {
  const category = panel.dataset.recordPanel;
  const selectedTeam = selectedAdminRecordTeams.get(category) ?? 'boys';
  for (const tab of panel.querySelectorAll('[data-record-team]')) {
    const active = tab.dataset.recordTeam === selectedTeam;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  }
}

initializeAdminRecordFilters();

function disableAuthForms() {
  [loginForm, signupForm].forEach(form => {
    form.addEventListener('submit', event => event.preventDefault());
    form.querySelectorAll('input, button').forEach(control => {
      control.disabled = true;
    });
  });
  [authModeToggle, loginModeToggle].forEach(control => {
    control.disabled = true;
  });
}

authModeToggle.addEventListener('click', () => {
  loginForm.hidden = true;
  authModeToggle.hidden = true;
  signupForm.hidden = false;
  loginModeToggle.hidden = false;
  authModeToggle.setAttribute('aria-expanded', 'true');
  loginModeToggle.setAttribute('aria-expanded', 'false');
  setStatus(authStatus, '');
  signupForm.elements.namedItem('full_name').focus();
});

loginModeToggle.addEventListener('click', () => {
  signupForm.hidden = true;
  loginModeToggle.hidden = true;
  loginForm.hidden = false;
  authModeToggle.hidden = false;
  authModeToggle.setAttribute('aria-expanded', 'false');
  loginModeToggle.setAttribute('aria-expanded', 'true');
  setStatus(authStatus, '');
  loginForm.elements.namedItem('email').focus();
});

const config = window.ATHLETICS_SUPABASE_CONFIG;
if (!config || !config.url || config.url.includes('YOUR_PROJECT_ID') || !config.anonKey || config.anonKey.includes('YOUR_SUPABASE')) {
  disableAuthForms();
  setStatus(authStatus, 'Supabase is not connected yet. See SUPABASE_SETUP.md in the project root for setup steps.', 'error');
} else if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  disableAuthForms();
  setStatus(authStatus, 'The Supabase client did not load. Check your network connection and reload this page.', 'error');
} else {
  const supabaseClient = window.supabase.createClient(config.url, config.anonKey);
  const recordImportToggle = document.querySelector('#record-import-toggle');
  const recordImportPanel = document.querySelector('#record-import-panel');
  const recordImportCategory = document.querySelector('#record-import-category');
  const recordImportTeam = document.querySelector('#record-import-team');
  const recordImportFile = document.querySelector('#record-import-file');
  const recordImportStatus = document.querySelector('#record-import-status');
  const recordImportPreview = document.querySelector('#record-import-preview');
  const recordImportSummary = document.querySelector('#record-import-summary');
  const recordImportContext = document.querySelector('#record-import-context');
  const recordImportRows = document.querySelector('#record-import-rows');
  const recordImportSave = document.querySelector('#record-import-save');
  const recordImportCancel = document.querySelector('#record-import-cancel');
  const recordImportEvents = document.querySelector('#record-import-events');
  const recordImportLibraries = new Map();
  let parsedImportRows = [];

  function loadRecordImportLibrary(src, libraryKey) {
    if (recordImportLibraries.has(libraryKey)) return recordImportLibraries.get(libraryKey);
    const promise = import(src).catch(error => {
      recordImportLibraries.delete(libraryKey);
      throw new Error(`Could not load the ${libraryKey} reader. Check your internet connection and try again. ${error.message}`);
    });
    recordImportLibraries.set(libraryKey, promise);
    return promise;
  }

  function buildPdfTextLines(textItems) {
    const items = textItems
      .filter(item => item.str?.trim())
      .map(item => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
        width: item.width ?? 0,
        fontSize: Math.hypot(item.transform[0], item.transform[1]) || 10,
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    for (const item of items) {
      let line = lines.find(candidate => Math.abs(candidate.y - item.y) <= 2.5);
      if (!line) {
        line = { y: item.y, items: [] };
        lines.push(line);
      }
      line.items.push(item);
    }
    return lines
      .sort((a, b) => b.y - a.y)
      .map(line => {
        const ordered = line.items.sort((a, b) => a.x - b.x);
        let value = '';
        let previousEnd = null;
        for (const item of ordered) {
          if (previousEnd !== null) {
            const gap = item.x - previousEnd;
            const averageCharacterWidth = Math.max(2, item.fontSize * 0.28);
            value += gap > item.fontSize * 1.25
              ? ' '.repeat(Math.min(16, Math.max(2, Math.round(gap / averageCharacterWidth))))
              : ' ';
          }
          value += item.text;
          previousEnd = item.x + item.width;
        }
        return value;
      });
  }

  function importRecordValidation(record) {
    const errors = [];
    if (!record.event) errors.push('Event is missing.');
    else if (!window.ATHLETICS_RECORD_IMPORT.isValidEvent(record.event)) errors.push('Choose a supported event.');
    if (!record.athlete) errors.push('Athlete name is missing.');
    if (!record.performance) errors.push('Performance is missing.');
    if (!record.record_label) errors.push('Year / meet is missing.');
    if (record.athlete.length > 300) errors.push('Athlete name exceeds 300 characters.');
    if (record.performance.length > 50) errors.push('Performance exceeds 50 characters.');
    if (record.record_label.length > 80) errors.push('Year / meet exceeds 80 characters.');
    if (record.college.length > 100) errors.push('College exceeds 100 characters.');
    return errors;
  }

  function importDuplicateReason(record, rowIndex) {
    const normalize = value => window.ATHLETICS_RECORD_IMPORT.normalizeHeader(value);
    const matches = candidate => candidate.team === record.team
      && candidate.record_type === record.record_type
      && normalize(candidate.event) === normalize(record.event)
      && normalize(candidate.athlete) === normalize(record.athlete)
      && normalize(candidate.performance) === normalize(record.performance)
      && normalize(candidate.record_label) === normalize(record.record_label);
    if (savedAdminRecords.some(matches)) return 'Possible duplicate of an existing saved record.';
    if (parsedImportRows.slice(0, rowIndex).some(row => matches({
      ...row.record,
      team: record.team,
      record_type: record.record_type,
    }))) return 'Possible duplicate of another row in this file.';
    return '';
  }

  function refreshRecordImportReview() {
    if (!recordImportPreview || recordImportPreview.hidden) return;
    const renderedRows = [...recordImportRows.querySelectorAll('[data-import-row]')];
    let validSelected = 0;
    let invalidSelected = 0;
    let excluded = 0;
    let selectedDuplicates = 0;
    renderedRows.forEach((rowElement, index) => {
      const row = parsedImportRows[index];
      const record = Object.fromEntries([...rowElement.querySelectorAll('[data-import-field]')].map(input => [input.dataset.importField, input.value.trim()]));
      row.record = record;
      const errors = importRecordValidation(record);
      const duplicate = importDuplicateReason({
        ...record,
        team: recordImportTeam.value,
        record_type: recordImportCategory.value,
      }, index);
      const messages = [...errors, ...(duplicate ? [duplicate] : [])];
      rowElement.classList.toggle('has-import-warning', messages.length > 0);
      rowElement.querySelector('[data-import-review]').textContent = messages.length ? messages.join(' ') : 'Ready';
      const include = rowElement.querySelector('[data-import-include]').checked;
      if (!include) {
        excluded += 1;
      } else if (errors.length) {
        invalidSelected += 1;
      } else {
        validSelected += 1;
        if (duplicate) selectedDuplicates += 1;
      }
    });
    recordImportSummary.textContent = `${parsedImportRows.length} rows · ${validSelected} ready to import · ${invalidSelected} selected need fixing · ${excluded} excluded`;
    recordImportSave.disabled = validSelected === 0 || invalidSelected > 0;
    recordImportSave.firstChild.textContent = validSelected
      ? `Import ${validSelected} selected record${validSelected === 1 ? '' : 's'} `
      : 'Import selected records ';
    recordImportSave.dataset.selectedDuplicates = String(selectedDuplicates);
  }

  function renderRecordImportPreview(records) {
    parsedImportRows = records.map(record => ({
      record,
      initiallyIncluded: importRecordValidation(record).length === 0,
    }));
    recordImportRows.replaceChildren(...parsedImportRows.map((item, index) => {
      const row = document.createElement('tr');
      row.dataset.importRow = '';
      const includeCell = document.createElement('td');
      const include = document.createElement('input');
      include.type = 'checkbox';
      include.checked = item.initiallyIncluded && !importDuplicateReason({
        ...item.record,
        team: recordImportTeam.value,
        record_type: recordImportCategory.value,
      }, index);
      include.setAttribute('aria-label', `Include imported row ${record.sourceRow ?? index + 1}`);
      include.dataset.importInclude = '';
      includeCell.append(include);
      row.append(includeCell);

      for (const [field, label, maxLength] of [
        ['event', 'Event', 40],
        ['athlete', 'Athlete(s)', 300],
        ['performance', 'Performance', 50],
        ['record_label', 'Year / meet', 80],
        ['college', 'College', 100],
      ]) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = item.record[field] ?? '';
        input.maxLength = maxLength;
        input.dataset.importField = field;
        input.setAttribute('aria-label', `${label}, imported row ${record.sourceRow ?? index + 1}`);
        if (field === 'event') input.setAttribute('list', 'record-import-events');
        cell.append(input);
        row.append(cell);
      }

      const reviewCell = document.createElement('td');
      const review = document.createElement('span');
      review.dataset.importReview = '';
      reviewCell.append(review);
      row.append(reviewCell);
      row.addEventListener('input', refreshRecordImportReview);
      row.addEventListener('change', refreshRecordImportReview);
      return row;
    }));
    const category = recordImportCategory.value;
    const team = recordImportTeam.value;
    recordImportContext.textContent = `${category === 'inter_iit' ? 'Inter IIT' : 'Institute'} Records · ${team === 'boys' ? 'Boys' : 'Girls'}`;
    recordImportCategory.disabled = true;
    recordImportTeam.disabled = true;
    recordImportPreview.hidden = false;
    refreshRecordImportReview();
  }

  async function readRecordImportFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'csv', 'pdf'].includes(extension)) throw new Error('Choose an .xlsx, .csv, or text-based .pdf file.');
    if (file.size === 0) throw new Error('The selected file is empty.');
    if (file.size > 15 * 1024 * 1024) throw new Error('The file is larger than 15 MB. Reduce its size and try again.');
    if (extension === 'csv') {
      const parsed = window.ATHLETICS_RECORD_IMPORT.parseCsv(await file.text());
      if (parsed.error) throw new Error(parsed.error);
      return parsed.records;
    }
    if (extension === 'xlsx') {
      const XLSX = await loadRecordImportLibrary('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs', 'xlsx');
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) throw new Error('The Excel workbook does not contain a worksheet.');
      const parsed = window.ATHLETICS_RECORD_IMPORT.parseGrid(XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], {
        header: 1,
        raw: false,
        defval: '',
      }));
      if (parsed.error) throw new Error(parsed.error);
      return parsed.records;
    }

    const pdfjs = await loadRecordImportLibrary('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.mjs', 'pdfjs');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs';
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    if (pdf.numPages > 30) throw new Error('This PDF has more than 30 pages. Split it into smaller files and try again.');
    const textLines = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      textLines.push(...buildPdfTextLines(content.items));
    }
    const text = textLines.join('\n');
    if (text.replace(/\s/g, '').length < 30) {
      throw new Error('No usable text was found in this PDF. It may be scanned or image-only; OCR is not supported. No data was imported.');
    }
    const parsed = window.ATHLETICS_RECORD_IMPORT.parsePdfText(text);
    if (parsed.error) throw new Error(parsed.error);
    const unreliableRow = parsed.records.find(record =>
      !window.ATHLETICS_RECORD_IMPORT.isValidEvent(record.event)
      || !record.athlete
      || !/\d/.test(record.performance)
      || !record.record_label);
    if (unreliableRow) {
      throw new Error('The PDF text could not be aligned into complete event, athlete, performance, and year/meet columns. No data was imported. Export it as CSV or Excel, or use a simpler text-based table PDF.');
    }
    return parsed.records;
  }

  function clearRecordImportPreview(clearFile = true) {
    parsedImportRows = [];
    recordImportRows.replaceChildren();
    recordImportPreview.hidden = true;
    recordImportCategory.disabled = false;
    recordImportTeam.disabled = false;
    recordImportFile.disabled = !(recordImportCategory.value && recordImportTeam.value);
    recordImportSave.disabled = true;
    recordImportSave.dataset.selectedDuplicates = '0';
    if (clearFile) recordImportFile.value = '';
  }

  async function savePersonalBestSharingPreference() {
    if (!personalBestSharingToggle || !personalBestSharingStatus) return;
    if (!['member', 'admin'].includes(currentRole)) {
      setStatus(personalBestSharingStatus, 'Sign in with an approved team or admin account to change this setting.', 'error');
      return;
    }
    const previousValue = personalBestSharingByOwner.get(currentUserId) === true;
    const nextValue = personalBestSharingToggle.checked;
    personalBestSharingToggle.disabled = true;
    setStatus(personalBestSharingStatus, 'Updating your team-sharing preference…');
    try {
      const { error } = await supabaseClient
        .from('athlete_personal_best_preferences')
        .upsert({ user_id: currentUserId, share_with_team: nextValue }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch (error) {
      personalBestSharingToggle.disabled = false;
      personalBestSharingToggle.checked = previousValue;
      console.error('Unable to update personal-best sharing preference.', error);
      setStatus(personalBestSharingStatus, `Could not update sharing preference: ${error.message || 'network error'}`, 'error');
      return;
    }
    personalBestSharingToggle.disabled = false;
    personalBestSharingByOwner.set(currentUserId, nextValue);
    await loadPersonalBests();
    setStatus(personalBestSharingStatus, nextValue
      ? 'All your personal bests are now visible to approved, email-verified team members.'
      : 'Team access to all your personal bests has been turned off.', 'success');
  }

  function startPersonalBestSharingWatcher() {
    if (personalBestSharingChannel) supabaseClient.removeChannel(personalBestSharingChannel);
    personalBestSharingChannel = supabaseClient
      .channel('athlete-personal-best-sharing')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'athlete_personal_best_preferences',
      }, () => {
        window.clearTimeout(personalBestSharingReloadTimer);
        personalBestSharingReloadTimer = window.setTimeout(() => {
          loadPersonalBests();
        }, 150);
      })
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Live personal-best sharing updates are unavailable.', status);
          if (personalBestSharingStatus) {
            setStatus(personalBestSharingStatus, 'Live sharing updates are unavailable. Refresh personal bests to check the latest visibility.', 'error');
          }
        }
      });
  }

  function stopPersonalBestSharingWatcher() {
    window.clearTimeout(personalBestSharingReloadTimer);
    if (personalBestSharingChannel) {
      supabaseClient.removeChannel(personalBestSharingChannel);
      personalBestSharingChannel = null;
    }
  }

  function initializeRecordImport() {
    if (!recordImportToggle || !recordImportPanel || !recordImportFile || !window.ATHLETICS_RECORD_IMPORT) return;
    recordImportFile.disabled = !(recordImportCategory.value && recordImportTeam.value);
    recordImportEvents.replaceChildren(...window.ATHLETICS_RECORD_IMPORT.EVENTS.map(event => {
      const option = document.createElement('option');
      option.value = event;
      return option;
    }));
    [recordImportCategory, recordImportTeam].forEach(select => {
      select.addEventListener('change', () => {
        recordImportFile.disabled = !(recordImportCategory.value && recordImportTeam.value);
        if (recordImportFile.disabled) setStatus(recordImportStatus, 'Choose both a record category and team before selecting a file.');
        else setStatus(recordImportStatus, 'Category and team selected. Choose an Excel, CSV, or text-based PDF file.');
      });
    });
    recordImportToggle.addEventListener('click', () => {
      if (currentRole !== 'admin' || !isAdminPage) return;
      recordImportPanel.hidden = !recordImportPanel.hidden;
      recordImportToggle.setAttribute('aria-expanded', String(!recordImportPanel.hidden));
    });
    recordImportFile.addEventListener('change', async () => {
      const file = recordImportFile.files[0];
      clearRecordImportPreview(false);
      if (!file) return;
      if (currentRole !== 'admin' || !isAdminPage) {
        setStatus(recordImportStatus, 'Only an administrator can import records.', 'error');
        return;
      }
      setStatus(recordImportStatus, 'Reading file locally…');
      recordImportFile.disabled = true;
      recordImportCategory.disabled = true;
      recordImportTeam.disabled = true;
      try {
        const records = await readRecordImportFile(file);
        if (records.length > 500) throw new Error('The file contains more than 500 rows. Split it into smaller files before importing.');
        renderRecordImportPreview(records);
        const duplicates = parsedImportRows.filter((row, index) => importDuplicateReason({
          ...row.record,
          team: recordImportTeam.value,
          record_type: recordImportCategory.value,
        }, index)).length;
        setStatus(recordImportStatus, `Preview ready. Check every row before saving.${duplicates ? ` ${duplicates} possible duplicate${duplicates === 1 ? '' : 's'} flagged.` : ''}`);
      } catch (error) {
        console.error('Unable to parse athletics records import file.', error);
        setStatus(recordImportStatus, error.message || 'Could not read this file. No records were imported.', 'error');
        recordImportFile.value = '';
        recordImportCategory.disabled = false;
        recordImportTeam.disabled = false;
      } finally {
        recordImportFile.disabled = recordImportPreview.hidden
          && !(recordImportCategory.value && recordImportTeam.value);
      }
    });
    recordImportCancel.addEventListener('click', () => clearRecordImportPreview());
    recordImportSave.addEventListener('click', async () => {
      if (currentRole !== 'admin' || !isAdminPage) {
        setStatus(recordImportStatus, 'Only an administrator can import records.', 'error');
        return;
      }
      refreshRecordImportReview();
      const rows = [...recordImportRows.querySelectorAll('[data-import-row]')];
      const records = rows.filter(row => row.querySelector('[data-import-include]').checked)
        .map(row => Object.fromEntries([...row.querySelectorAll('[data-import-field]')].map(input => [input.dataset.importField, input.value.trim()])));
      if (!records.length || records.some(record => importRecordValidation(record).length)) {
        setStatus(recordImportStatus, 'Fix required fields or uncheck incomplete rows before importing.', 'error');
        return;
      }
      const duplicateCount = Number(recordImportSave.dataset.selectedDuplicates ?? 0);
      const category = recordImportCategory.value;
      const team = recordImportTeam.value;
      if (!['institute', 'inter_iit'].includes(category) || !['boys', 'girls'].includes(team)) {
        setStatus(recordImportStatus, 'Choose a valid record category and team before importing.', 'error');
        return;
      }
      const categoryLabel = category === 'inter_iit' ? 'Inter IIT' : 'Institute';
      const warning = duplicateCount
        ? `\n\n${duplicateCount} selected row${duplicateCount === 1 ? ' is' : 's are'} flagged as possible duplicate${duplicateCount === 1 ? '' : 's'}.`
        : '';
      if (!window.confirm(`Import ${records.length} ${categoryLabel} ${team} record${records.length === 1 ? '' : 's'} into Supabase?${warning}\n\nOnly the selected rows will be saved.`)) return;

      const payload = records.map(record => ({
        record_type: category,
        team,
        event: window.ATHLETICS_RECORD_IMPORT.normalizeEvent(record.event),
        athlete: record.athlete,
        performance: record.performance,
        record_label: record.record_label,
        college: record.college,
      }));
      recordImportSave.disabled = true;
      setStatus(recordImportStatus, `Saving ${payload.length} records…`);
      try {
        const { error } = await supabaseClient.from('athletics_records').insert(payload);
        if (error) {
          console.error('Unable to import athletics records.', error);
          setStatus(recordImportStatus, `Could not import records: ${error.message}. No success was reported; check the preview and try again.`, 'error');
          recordImportSave.disabled = false;
          return;
        }
      } catch (error) {
        console.error('The athletics records import request failed.', error);
        setStatus(recordImportStatus, `Could not complete the import: ${error.message || 'network error'}. No success was reported; check the records before retrying.`, 'error');
        recordImportSave.disabled = false;
        return;
      }
      clearRecordImportPreview();
      await loadAthleticsRecords();
      recordCategoryTabs.querySelector(`[data-record-category="${category}"]`).click();
      recordCategoryPanels.get(category).querySelector(`[data-record-team="${team}"]`).click();
      setStatus(recordImportStatus, `${payload.length} ${categoryLabel} ${team} record${payload.length === 1 ? '' : 's'} imported successfully.`, 'success');
    });
  }

  initializeRecordImport();

  function showLogin(message = '') {
    stopPersonalBestSharingWatcher();
    authCard.hidden = false;
    membershipPending.hidden = true;
    athleteDashboard.hidden = true;
    sessionBeingHandled = '';
    membershipAdmin.hidden = true;
    if (recordAdmin) recordAdmin.hidden = true;
    if (personalBestAdmin) personalBestAdmin.hidden = true;
    if (personalBestSection) personalBestSection.hidden = true;
    currentRole = '';
    currentUserId = '';
    currentUserName = '';
    loginForm.hidden = false;
    signupForm.hidden = true;
    authModeToggle.hidden = isAdminPage;
    loginModeToggle.hidden = true;
    authModeToggle.setAttribute('aria-expanded', 'false');
    loginModeToggle.setAttribute('aria-expanded', 'true');
    if (adminDashboardLink) adminDashboardLink.hidden = true;
    if (isAdminPage) {
      document.querySelector('#auth-title').textContent = 'Admin sign-in.';
      document.querySelector('.auth-card-heading > p:last-child').textContent = 'Sign in with an approved athletics admin account to manage team access and athlete profiles.';
    }
    setStatus(authStatus, message, message ? 'error' : '');
  }

  function showMembershipPending(title, message) {
    authCard.hidden = true;
    athleteDashboard.hidden = true;
    membershipPending.hidden = false;
    membershipAdmin.hidden = true;
    if (recordAdmin) recordAdmin.hidden = true;
    if (personalBestAdmin) personalBestAdmin.hidden = true;
    if (personalBestSection) personalBestSection.hidden = true;
    document.querySelector('#membership-pending-title').textContent = title;
    document.querySelector('#membership-pending-message').textContent = message;
  }

  function setFormMode(profile = null) {
    athleteForm.reset();
    athleteForm.hidden = isAdminPage && !profile;
    if (addProfileButton) addProfileButton.hidden = isAdminPage && Boolean(profile);
    athleteForm.elements.namedItem('id').value = profile?.id ?? '';
    if (profile) {
      ['full_name', 'team', 'event', 'batch', 'photo_url', 'bio'].forEach(field => {
        athleteForm.elements.namedItem(field).value = profile[field] ?? '';
      });
      document.querySelector('#profile-form-title').textContent = 'Edit athlete profile';
      athleteForm.querySelector('.profile-submit-label').textContent = 'Update profile';
      profileEditor.querySelector('.profile-editor-heading p').textContent = currentRole === 'member'
        ? 'Only you can edit your profile.'
        : 'Update the athlete profile.';
      cancelEditButton.hidden = false;
      cancelEditButton.textContent = 'Cancel edit';
    } else {
      document.querySelector('#profile-form-title').textContent = 'Add an athlete';
      athleteForm.querySelector('.profile-submit-label').textContent = 'Save profile';
      if (currentRole === 'member') {
        athleteForm.elements.namedItem('full_name').value = currentUserName;
        document.querySelector('#profile-form-title').textContent = 'Create my profile';
        athleteForm.querySelector('.profile-submit-label').textContent = 'Create profile';
        profileEditor.querySelector('.profile-editor-heading p').textContent = 'Create your own athlete profile. You can edit it later.';
      } else {
        profileEditor.querySelector('.profile-editor-heading p').textContent = 'Build a profile for the team directory.';
      }
      cancelEditButton.hidden = currentRole === 'member';
      cancelEditButton.textContent = currentRole === 'admin' ? 'Cancel' : 'Cancel edit';
    }
    setStatus(formStatus, '');
  }

  function makeProfileCard(profile) {
    const card = document.createElement('article');
    card.className = 'athlete-profile-card';

    if (profile.photo_url && /^https?:\/\//i.test(profile.photo_url)) {
      const image = document.createElement('img');
      image.className = 'athlete-profile-photo';
      image.src = profile.photo_url;
      image.alt = profile.full_name;
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', () => image.remove(), { once: true });
      card.append(image);
    } else {
      const initials = document.createElement('span');
      initials.className = 'athlete-profile-initials';
      initials.setAttribute('aria-hidden', 'true');
      initials.textContent = profile.full_name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
      card.append(initials);
    }

    const copy = document.createElement('div');
    copy.className = 'athlete-profile-copy';
    const title = document.createElement('h4');
    title.textContent = profile.full_name;
    const meta = document.createElement('p');
    meta.className = 'athlete-profile-meta';
    meta.textContent = [profile.team, profile.event, profile.batch].filter(Boolean).join(' · ');
    copy.append(title, meta);
    if (profile.bio) {
      const bio = document.createElement('p');
      bio.className = 'athlete-profile-bio';
      bio.textContent = profile.bio;
      copy.append(bio);
    }

    const canEdit = currentRole === 'admin'
      || (currentRole === 'member' && profile.owner_user_id === currentUserId);
    if (canEdit) {
      const actions = document.createElement('div');
      actions.className = 'athlete-profile-actions';
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = currentRole === 'member' ? 'Edit my profile' : 'Edit';
      editButton.addEventListener('click', () => {
        setFormMode(profile);
        athleteForm.elements.namedItem('full_name').focus();
        athleteForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      actions.append(editButton);

      if (currentRole === 'admin') {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteProfile(profile.id, profile.full_name));
        actions.append(deleteButton);
      }
      card.append(copy, actions);
    } else {
      card.append(copy);
    }
    return card;
  }

  async function loadProfiles() {
    setStatus(directoryStatus, 'Loading athlete profiles…');
    const { data, error } = await supabaseClient
      .from('athletes')
      .select('id, full_name, team, event, batch, bio, photo_url, owner_user_id, created_at')
      .order('full_name', { ascending: true });
    if (error) {
      console.error('Unable to load athlete profiles.', error);
      setStatus(directoryStatus, `Could not load profiles: ${error.message}`, 'error');
      return;
    }

    renderPaginatedList(athleteList, profilesPagination, data, makeProfileCard, 'profiles');
    directoryCount.textContent = `${data.length} ${data.length === 1 ? 'profile' : 'profiles'}`;
    setStatus(directoryStatus, data.length ? '' : 'No athlete profiles yet.');
    if (currentRole === 'member') {
      const ownProfile = data.find(profile => profile.owner_user_id === currentUserId);
      setFormMode(ownProfile || null);
      document.querySelector('#profile-form-title').textContent = ownProfile ? 'My profile' : 'Create my profile';
    } else if (currentRole === 'admin' && !athleteForm.elements.namedItem('id').value) {
      setFormMode();
    }
  }

  function categoryTitle(recordType) {
    return RECORD_CATEGORIES[recordType]
      ?? recordType.split('_').filter(Boolean).map(word => `${word[0].toUpperCase()}${word.slice(1)}`).join(' ');
  }

  function getPublishedRecords() {
    return Object.entries(window.ATHLETICS_RECORD_DATA).flatMap(([team, groups]) => [
      ...groups.interIit.map(record => ({
        ...record,
        team,
        record_type: 'inter_iit',
        record_label: record.year,
      })),
      ...groups.institute.map(record => ({
        ...record,
        team,
        record_type: 'institute',
        record_label: record.competition,
      })),
    ]);
  }

  function renderRecordCategoryMenu() {
    if (!profileRecordMenuOptions) return;
    const recordTypes = [...new Set([
      ...Object.keys(RECORD_CATEGORIES),
      ...profileRecords.map(record => record.record_type),
    ])];
    profileRecordMenuOptions.replaceChildren(...recordTypes.map(recordType => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'profile-record-menu-option';
      button.textContent = categoryTitle(recordType);
      button.setAttribute('aria-pressed', String(recordType === selectedRecordType));
      button.addEventListener('click', () => {
        selectedRecordType = recordType;
        localStorage.setItem('athletics-record-type', recordType);
        profileRecordMenu.open = false;
        renderProfileRecords();
        profileRecordMenu.querySelector('summary').focus();
      });
      return button;
    }));
  }

  function renderProfileRecords() {
    if (!profileRecordRows) return;
    renderRecordCategoryMenu();
    profileRecordSelected.textContent = categoryTitle(selectedRecordType);
    const records = profileRecords.filter(record =>
      record.record_type === selectedRecordType && record.team === selectedRecordTeam);
    profileRecordRows.replaceChildren();
    if (!records.length) {
      const row = document.createElement('tr');
      const message = document.createElement('td');
      message.colSpan = 5;
      message.className = 'profile-record-empty';
      message.textContent = `No entries are available for the ${selectedRecordTeam} team in this category yet.`;
      row.append(message);
      profileRecordRows.append(row);
      return;
    }

    records.forEach(record => {
      const row = document.createElement('tr');
      const eventCell = document.createElement('th');
      eventCell.scope = 'row';
      eventCell.textContent = record.event;
      row.append(eventCell);
      [record.athlete, record.record_label, record.college, record.performance].forEach(value => {
        const cell = document.createElement('td');
        cell.textContent = value ?? '';
        row.append(cell);
      });
      profileRecordRows.append(row);
    });
  }

  function selectRecordTeam(team) {
    selectedRecordTeam = team;
    localStorage.setItem('athletics-record-team', team);
    [profileBoysTab, profileGirlsTab].forEach((tab, index) => {
      const selected = (index === 0 ? 'boys' : 'girls') === team;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    document.querySelector('#profile-record-table-panel').setAttribute(
      'aria-labelledby',
      team === 'boys' ? 'profile-boys-tab' : 'profile-girls-tab',
    );
    renderProfileRecords();
  }

  const profileRecordTablePanel = document.querySelector('#profile-record-table-panel');
  if (profileBoysTab && profileGirlsTab && profileRecordTablePanel && profileRecordRows) {
    profileBoysTab.addEventListener('click', () => selectRecordTeam('boys'));
    profileGirlsTab.addEventListener('click', () => selectRecordTeam('girls'));
    [profileBoysTab, profileGirlsTab].forEach(tab => tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const nextTab = tab === profileBoysTab ? profileGirlsTab : profileBoysTab;
      selectRecordTeam(nextTab === profileBoysTab ? 'boys' : 'girls');
      nextTab.focus();
    }));
    selectRecordTeam(selectedRecordTeam);
  }

  function resetRecordForm(form) {
    if (!form) return;
    const category = form.dataset.recordForm;
    form.reset();
    form.hidden = true;
    form.elements.namedItem('id').value = '';
    form.elements.namedItem('team').value = selectedAdminRecordTeams.get(category) ?? 'boys';
    const categoryInput = form.elements.namedItem('record_type');
    if (category !== 'other') categoryInput.value = category;
    const customField = form.querySelector('[data-custom-record-type-field]');
    if (customField) customField.hidden = true;
    const customInput = form.elements.namedItem('custom_record_type');
    if (customInput) customInput.required = false;
    form.querySelector('.record-submit-label').textContent = 'Add record';
    form.querySelector('[data-cancel-record-form]').hidden = true;
    addRecordButtons.get(category).hidden = false;
    form.querySelector('[data-record-form-status]').textContent = '';
    const teamLabel = form.querySelector('[data-record-form-team]');
    if (teamLabel) teamLabel.textContent = (selectedAdminRecordTeams.get(category) ?? 'boys') === 'boys' ? 'Boys' : 'Girls';
  }

  function makeAdminRecordCard(record) {
    const card = document.createElement('article');
    card.className = 'admin-record-card';
    const details = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = `${record.event} · ${record.performance}`;
    const athlete = document.createElement('p');
    athlete.textContent = record.athlete;
    const meta = document.createElement('small');
    meta.textContent = [
      record.team === 'boys' ? 'Boys' : 'Girls',
      categoryTitle(record.record_type),
      record.record_label,
      record.college,
    ].filter(Boolean).join(' · ');
    details.append(title, athlete, meta);

    const actions = document.createElement('div');
    actions.className = 'membership-request-actions';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      const category = isCoreRecordType(record.record_type) ? record.record_type : 'other';
      recordCategoryTabs.querySelector(`[data-record-category="${category}"]`).click();
      const categoryPanel = recordCategoryPanels.get(category);
      categoryPanel.querySelector(`[data-record-team="${record.team}"]`).click();
      const form = recordForms.get(category);
      const categoryInput = form.elements.namedItem('record_type');
      if (category === 'other') {
        const hasSavedOption = [...categoryInput.options].some(option => option.value === record.record_type);
        if (!hasSavedOption) {
          const option = document.createElement('option');
          option.value = record.record_type;
          option.textContent = categoryTitle(record.record_type);
          categoryInput.insertBefore(option, categoryInput.querySelector('[value="custom"]'));
        }
        categoryInput.value = record.record_type;
      }
      ['id', 'team', 'event', 'athlete', 'record_label', 'college', 'performance'].forEach(field => {
        form.elements.namedItem(field).value = record[field] ?? '';
      });
      const customField = form.querySelector('[data-custom-record-type-field]');
      if (customField) customField.hidden = true;
      const customInput = form.elements.namedItem('custom_record_type');
      if (customInput) customInput.required = false;
      form.querySelector('.record-submit-label').textContent = 'Update record';
      form.querySelector('[data-cancel-record-form]').hidden = false;
      form.hidden = false;
      addRecordButtons.get(category).hidden = true;
      const teamLabel = form.querySelector('[data-record-form-team]');
      if (teamLabel) teamLabel.textContent = record.team === 'boys' ? 'Boys' : 'Girls';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (category === 'other' ? categoryInput : form.elements.namedItem('event')).focus();
    });
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteAthleticsRecord(record));
    actions.append(editButton, deleteButton);
    card.append(details, actions);
    return card;
  }
  renderAdminRecord = makeAdminRecordCard;

  async function loadAthleticsRecords() {
    if (recordsStatus) setStatus(recordsStatus, 'Loading all team records…');
    profileRecords = getPublishedRecords();
    renderProfileRecords();
    const { data, error } = await supabaseClient
      .from('athletics_records')
      .select('id, team, record_type, event, athlete, record_label, college, performance, created_at')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Unable to load saved athletics records.', error);
      renderProfileRecords();
      const message = `Could not load newer saved records: ${error.message}. Showing the published records.`;
      if (recordsStatus) setStatus(recordsStatus, message, 'error');
      for (const status of recordListStatuses.values()) setStatus(status, message, 'error');
      return;
    }

    profileRecords = data;
    renderProfileRecords();
    const recordCount = profileRecords.length;
    if (recordsStatus) setStatus(recordsStatus, `${recordCount} total ${recordCount === 1 ? 'record' : 'records'}`);
    savedAdminRecords = data;
    const otherCategoryInput = recordForms.get('other')?.elements.namedItem('record_type');
    if (otherCategoryInput) {
      const existingValue = otherCategoryInput.value;
      const savedOtherTypes = [...new Set(data.map(record => record.record_type).filter(recordType => !isCoreRecordType(recordType)))];
      for (const option of [...otherCategoryInput.options]) {
        if (!['', 'trials', 'sportsfest', 'summer_trials', 'sangram', 'custom'].includes(option.value)) option.remove();
      }
      for (const recordType of savedOtherTypes) {
        if ([...otherCategoryInput.options].some(option => option.value === recordType)) continue;
        const option = document.createElement('option');
        option.value = recordType;
        option.textContent = categoryTitle(recordType);
        otherCategoryInput.insertBefore(option, otherCategoryInput.querySelector('[value="custom"]'));
      }
      if ([...otherCategoryInput.options].some(option => option.value === existingValue)) otherCategoryInput.value = existingValue;
    }
    renderAdminRecordLists();
  }

  function makePersonalBestCard(record, { canEdit = false, canDelete = false, isAdmin = false, ownerName = '' } = {}) {
    const card = document.createElement('article');
    card.className = 'personal-best-card';
    const details = document.createElement('div');
    const heading = document.createElement('h5');
    heading.textContent = `${record.event} · ${record.performance}`;
    const meta = document.createElement('p');
    const achievedDate = record.achieved_on
      ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${record.achieved_on}T00:00:00`))
      : 'Date not provided';
    const sharingEnabled = personalBestSharingByOwner.get(record.owner_user_id) === true;
    const sharingLabel = record.owner_user_id === currentUserId
      ? (sharingEnabled ? 'Sharing with team on' : 'Private to you and admins')
      : (sharingEnabled ? 'Shared with team' : 'Private');
    meta.textContent = [ownerName, achievedDate, sharingLabel].filter(Boolean).join(' · ');
    details.append(heading, meta);
    if (record.note) {
      const note = document.createElement('p');
      note.className = 'personal-best-note-copy';
      note.textContent = record.note;
      details.append(note);
    }

    const actions = document.createElement('div');
    actions.className = 'personal-best-actions';
    if (canEdit) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', () => {
        personalBestForm.elements.namedItem('id').value = record.id;
        personalBestForm.elements.namedItem('event').value = record.event;
        personalBestForm.elements.namedItem('performance').value = record.performance;
        personalBestForm.elements.namedItem('achieved_on').value = record.achieved_on ?? '';
        personalBestForm.elements.namedItem('note').value = record.note ?? '';
        personalBestSubmitLabel.textContent = 'Update personal best';
        cancelPersonalBestEdit.hidden = false;
        personalBestForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        personalBestForm.elements.namedItem('event').focus();
      });
      actions.append(editButton);
    }
    if (canDelete) {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deletePersonalBest(record, isAdmin));
      actions.append(deleteButton);
    }
    card.append(details);
    if (actions.childElementCount) card.append(actions);
    return card;
  }

  async function loadPersonalBests() {
    const status = isAdminPage ? personalBestAdminStatus : myPersonalBestsStatus;
    if (status) setStatus(status, 'Loading personal bests…');
    const { data, error } = await supabaseClient
      .from('athlete_personal_bests')
      .select('id, owner_user_id, event, performance, achieved_on, note, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Unable to load athlete personal bests.', error);
      const message = `Could not load personal bests: ${error.message}. The personal-best database migration may need to be run.`;
      if (myPersonalBestsStatus) setStatus(myPersonalBestsStatus, message, 'error');
      if (teamPersonalBestsStatus) setStatus(teamPersonalBestsStatus, message, 'error');
      if (personalBestAdminStatus) setStatus(personalBestAdminStatus, message, 'error');
      return;
    }

    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('athlete_personal_best_preferences')
      .select('user_id, share_with_team');
    if (preferencesError) {
      console.error('Unable to load personal-best sharing preferences.', preferencesError);
      const message = `Could not load team-sharing preferences: ${preferencesError.message}. Run the personal-best profile-sharing migration.`;
      if (personalBestSharingStatus) setStatus(personalBestSharingStatus, message, 'error');
      if (myPersonalBestsStatus) setStatus(myPersonalBestsStatus, message, 'error');
      if (teamPersonalBestsStatus) setStatus(teamPersonalBestsStatus, message, 'error');
      if (personalBestAdminStatus) setStatus(personalBestAdminStatus, message, 'error');
      return;
    }
    personalBestSharingByOwner.clear();
    preferences.forEach(preference => personalBestSharingByOwner.set(preference.user_id, preference.share_with_team));
    const ownSharingEnabled = personalBestSharingByOwner.get(currentUserId) === true;
    if (personalBestSharingToggle) personalBestSharingToggle.checked = ownSharingEnabled;

    if (isAdminPage) {
      const { data: members, error: memberError } = await supabaseClient
        .from('athlete_members')
        .select('user_id, full_name');
      if (memberError) {
        console.error('Unable to load personal-best owner names.', memberError);
        setStatus(personalBestAdminStatus, `Personal bests loaded, but athlete names could not be loaded: ${memberError.message}`, 'error');
      }
      const memberNames = new Map((members ?? []).map(member => [member.user_id, member.full_name]));
      if (currentUserName) memberNames.set(currentUserId, currentUserName);
      const ownRecords = data.filter(record => record.owner_user_id === currentUserId);
      renderPaginatedList(myPersonalBestList, myPersonalBestPagination, ownRecords, record => makePersonalBestCard(record, {
        canEdit: true,
        canDelete: true,
      }), 'my-personal-bests');
      if (myPersonalBestCount) myPersonalBestCount.textContent = `${ownRecords.length} saved ${ownRecords.length === 1 ? 'PB' : 'PBs'}`;
      if (myPersonalBestsStatus) setStatus(myPersonalBestsStatus, ownRecords.length ? '' : 'You have not added any personal bests yet.');
      renderPaginatedList(personalBestAdminList, personalBestAdminPagination, data, record => makePersonalBestCard(record, {
        ownerName: memberNames.get(record.owner_user_id) || 'Team member',
        canEdit: true,
        canDelete: true,
        isAdmin: true,
      }), 'admin-personal-bests');
      if (!memberError) {
        setStatus(personalBestAdminStatus, data.length
          ? `${data.length} ${data.length === 1 ? 'personal best' : 'personal bests'} · private and team-shared`
          : 'No athlete personal bests have been submitted yet.');
      }
      return;
    }

    const ownRecords = data.filter(record => record.owner_user_id === currentUserId);
    const sharedRecords = data.filter(record => record.owner_user_id !== currentUserId
      && personalBestSharingByOwner.get(record.owner_user_id) === true);
    renderPaginatedList(myPersonalBestList, myPersonalBestPagination, ownRecords, record => makePersonalBestCard(record, {
      canEdit: true,
      canDelete: true,
    }), 'my-personal-bests');
    myPersonalBestCount.textContent = `${ownRecords.length} saved ${ownRecords.length === 1 ? 'PB' : 'PBs'}`;
    setStatus(myPersonalBestsStatus, ownRecords.length ? '' : 'You have not added any personal bests yet.');

    const { data: athletes, error: athleteError } = await supabaseClient
      .from('athletes')
      .select('owner_user_id, full_name')
      .not('owner_user_id', 'is', null);
    if (athleteError) {
      console.error('Unable to load team-shared personal-best athlete names.', athleteError);
      setStatus(teamPersonalBestsStatus, `Could not load athlete names: ${athleteError.message}`, 'error');
      return;
    }
    const memberNames = new Map(athletes.map(athlete => [athlete.owner_user_id, athlete.full_name]));
    renderPaginatedList(teamPersonalBestList, teamPersonalBestPagination, sharedRecords, record => makePersonalBestCard(record, {
      ownerName: memberNames.get(record.owner_user_id) || 'Team member',
    }), 'team-personal-bests');
    setStatus(teamPersonalBestsStatus, sharedRecords.length
      ? `${sharedRecords.length} team-shared ${sharedRecords.length === 1 ? 'PB' : 'PBs'}`
      : 'No teammates have shared personal bests yet.');
  }

  function resetPersonalBestForm() {
    if (!personalBestForm) return;
    personalBestForm.reset();
    personalBestForm.elements.namedItem('id').value = '';
    personalBestSubmitLabel.textContent = 'Save personal best';
    cancelPersonalBestEdit.hidden = true;
    setStatus(personalBestFormStatus, '');
  }

  async function deletePersonalBest(record, isAdmin = false) {
    const prompt = isAdmin
      ? `Delete ${record.event} personal best (${record.performance}) submitted by this athlete? This cannot be undone.`
      : `Delete your ${record.event} personal best (${record.performance})? This cannot be undone.`;
    if (!window.confirm(prompt)) return;
    let query = supabaseClient.from('athlete_personal_bests').delete().eq('id', record.id);
    if (!isAdmin) query = query.eq('owner_user_id', currentUserId);
    const { error } = await query;
    if (error) {
      console.error('Unable to delete athlete personal best.', error);
      const status = isAdmin ? personalBestAdminStatus : myPersonalBestsStatus;
      setStatus(status, `Could not delete personal best: ${error.message}`, 'error');
      return;
    }
    await loadPersonalBests();
    if (!isAdmin) resetPersonalBestForm();
    setStatus(isAdmin ? personalBestAdminStatus : myPersonalBestsStatus, 'Personal best deleted.');
  }

  async function deleteAthleticsRecord(record) {
    if (!window.confirm(`Delete the ${record.event} record for ${record.athlete}? This cannot be undone.`)) return;
    const { error } = await supabaseClient.from('athletics_records').delete().eq('id', record.id);
    if (error) {
      console.error('Unable to delete athletics record.', error);
      const category = isCoreRecordType(record.record_type) ? record.record_type : 'other';
      setStatus(recordListStatuses.get(category), `Could not delete record: ${error.message}`, 'error');
      return;
    }
    const category = isCoreRecordType(record.record_type) ? record.record_type : 'other';
    const form = recordForms.get(category);
    if (form.elements.namedItem('id').value === record.id) resetRecordForm(form);
    await loadAthleticsRecords();
    setStatus(recordListStatuses.get(category), 'Record deleted.');
  }

  async function loadMembershipRequests() {
    setStatus(membershipStatus, 'Loading membership requests…');
    const { data, error } = await supabaseClient
      .from('athlete_members')
      .select('user_id, full_name, email, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Unable to load membership requests.', error);
      setStatus(membershipStatus, `Could not load membership requests: ${error.message}`, 'error');
      return;
    }

    membershipRequestCount.textContent = `${data.length} pending ${data.length === 1 ? 'request' : 'requests'}`;
    renderPaginatedList(membershipRequestList, membershipPagination, data, makeMembershipRequestCard, 'membership-requests');
    if (data.length === 0) {
      setStatus(membershipStatus, 'No pending membership requests.');
      return;
    }
    setStatus(membershipStatus, 'Confirm the person belongs to the athletics team before approving.');
    data.forEach(request => membershipRequestList.append(makeMembershipRequestCard(request)));
  }

  function makeMembershipRequestCard(request) {
    const card = document.createElement('article');
    card.className = 'membership-request-card';
    const details = document.createElement('div');
    const name = document.createElement('h4');
    name.textContent = request.full_name;
    const email = document.createElement('p');
    email.textContent = request.email;
    const date = document.createElement('small');
    date.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(request.created_at));
    details.append(name, email, date);

    const actions = document.createElement('div');
    actions.className = 'membership-request-actions';
    [['approved', 'Approve'], ['rejected', 'Reject']].forEach(([status, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.className = status === 'approved' ? 'approve-member-button' : 'reject-member-button';
      button.addEventListener('click', () => updateMembershipStatus(request.user_id, status, request.full_name));
      actions.append(button);
    });
    card.append(details, actions);
    return card;
  }

  async function updateMembershipStatus(userId, status, name) {
    const { error } = await supabaseClient
      .from('athlete_members')
      .update({ status })
      .eq('user_id', userId)
      .eq('status', 'pending');
    if (error) {
      console.error('Unable to update membership request.', error);
      setStatus(membershipStatus, `Could not update request: ${error.message}`, 'error');
      return;
    }
    await loadMembershipRequests();
    setStatus(membershipStatus, status === 'approved' ? `${name} is now an approved team member.` : `${name}'s request was rejected.`);
  }

  async function handleSession(session) {
    if (!session) {
      sessionBeingHandled = '';
      showLogin(athleteDashboard.hidden ? authStatus.textContent : '');
      return;
    }

    if (sessionBeingHandled === session.user.id) return;
    sessionBeingHandled = session.user.id;
    currentUserId = session.user.id;
    currentUserName = String(session.user.user_metadata?.full_name ?? '');
    setStatus(authStatus, 'Checking admin access…');
    const { data: admin, error } = await supabaseClient
      .from('athlete_admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) {
      console.error('Unable to verify athlete admin access.', error);
      showLogin(`Could not verify admin access: ${error.message}. Check the Supabase setup.`);
      return;
    }
    if (admin) {
      currentRole = 'admin';
      startPersonalBestSharingWatcher();
      authCard.hidden = true;
      membershipPending.hidden = true;
      athleteDashboard.hidden = false;
      membershipAdmin.hidden = !isAdminPage;
      if (recordAdmin) recordAdmin.hidden = !isAdminPage;
      if (personalBestAdmin) personalBestAdmin.hidden = !isAdminPage;
      if (personalBestSection) personalBestSection.hidden = false;
      if (adminDashboardLink) adminDashboardLink.hidden = isAdminPage;
      document.querySelector('.dashboard-heading .eyebrow').lastChild.textContent = isAdminPage
        ? ' ATHLETICS OPERATIONS · ADMIN'
        : ' TEAM DIRECTORY · ADMIN';
      document.querySelector('.dashboard-heading h2').textContent = isAdminPage
        ? 'Team administration.'
        : 'Manage athlete profiles.';
      profileEditor.hidden = false;
      setFormMode();
      const tasks = [loadProfiles(), loadAthleticsRecords(), loadPersonalBests()];
      if (isAdminPage) tasks.push(loadMembershipRequests());
      await Promise.all(tasks);
      return;
    }

    if (isAdminPage) {
      showMembershipPending(
        'Admin access only.',
        'This page is restricted to athletics administrators. Sign in with an admin account or return to the athlete profiles page.',
      );
      return;
    }
    if (recordAdmin) recordAdmin.hidden = true;
    if (personalBestAdmin) personalBestAdmin.hidden = true;

    const { data: membership, error: membershipError } = await supabaseClient
      .from('athlete_members')
      .select('status, full_name')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (membershipError) {
      console.error('Unable to verify team membership.', membershipError);
      showLogin(`Could not verify team membership: ${membershipError.message}. The membership database update may be required.`);
      return;
    }
    if (!membership) {
      showMembershipPending(
        'Account setup is incomplete.',
        'Your login exists, but no team membership request was found. Ask the athletics admin to run the latest database setup script.',
      );
      return;
    }
    if (membership.status === 'rejected') {
      showMembershipPending(
        'Access request not approved.',
        'Your team access request was not approved. Contact the athletics admin if you think this is a mistake.',
      );
      return;
    }
    if (membership.status !== 'approved') {
      showMembershipPending(
        'Your request is being reviewed.',
        'Please verify your email if prompted. An athletics admin will approve your account before directory access is enabled.',
      );
      return;
    }
    if (!session.user.email_confirmed_at && !session.user.confirmed_at) {
      showMembershipPending(
        'Verify your email to continue.',
        'Your access has been approved. Confirm your email using the verification link before opening athlete profiles.',
      );
      return;
    }

    currentRole = 'member';
    startPersonalBestSharingWatcher();
    authCard.hidden = true;
    membershipPending.hidden = true;
    athleteDashboard.hidden = false;
    membershipAdmin.hidden = true;
    if (personalBestSection) personalBestSection.hidden = false;
    if (adminDashboardLink) adminDashboardLink.hidden = true;
    document.querySelector('.dashboard-heading .eyebrow').lastChild.textContent = ' TEAM DIRECTORY · MEMBER';
    document.querySelector('.dashboard-heading h2').textContent = 'Athlete profiles.';
    document.querySelector('#directory-title').textContent = 'Team directory';
    profileEditor.hidden = false;
    setFormMode();
    await Promise.all([loadProfiles(), loadAthleticsRecords(), loadPersonalBests()]);
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setStatus(authStatus, 'Signing in…');
    const formData = new FormData(event.currentTarget);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: formData.get('email'),
        password: formData.get('password'),
      });
      if (error) {
        setStatus(authStatus, `Sign-in failed: ${error.message}`, 'error');
      } else if (data.session) {
        await handleSession(data.session);
      } else {
        setStatus(authStatus, 'Sign-in did not create a session. Check your email verification status and try again.', 'error');
      }
    } catch (error) {
      console.error('Unable to sign in.', error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(authStatus, `Sign-in failed: ${message}`, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  forgotPasswordButton?.addEventListener('click', async () => {
    const emailInput = loginForm.elements.namedItem('email');
    emailInput.value = emailInput.value.trim();
    if (!emailInput.reportValidity()) return;

    forgotPasswordButton.disabled = true;
    setStatus(authStatus, 'Sending password recovery instructions…');
    try {
      const redirectTo = new URL('../auth/reset-password.html', window.location.href).href;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput.value, { redirectTo });
      if (error) {
        setStatus(authStatus, `Could not send recovery instructions: ${error.message}`, 'error');
      } else {
        setStatus(authStatus, 'If an account exists for that email, password recovery instructions have been sent.', 'success');
      }
    } catch (error) {
      console.error('Unable to request password recovery.', error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(authStatus, `Could not send recovery instructions: ${message}`, 'error');
    } finally {
      forgotPasswordButton.disabled = false;
    }
  });

  signupForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    const formData = new FormData(event.currentTarget);
    submitButton.disabled = true;
    setStatus(authStatus, 'Creating your account…');
    const { data, error } = await supabaseClient.auth.signUp({
      email: String(formData.get('email')).trim(),
      password: String(formData.get('password')),
      options: {
        data: { full_name: String(formData.get('full_name')).trim() },
      },
    });
    submitButton.disabled = false;
    if (error) {
      setStatus(authStatus, `Could not create account: ${error.message}`, 'error');
      return;
    }
    signupForm.reset();
    if (!data.session) {
      setStatus(authStatus, 'Account created. Check your email for a verification link. The admin can review your request after signup.', 'success');
      return;
    }
    await handleSession(data.session);
  });

  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error('Unable to sign out.', error);
      const statusTarget = athleteDashboard.hidden ? authStatus : directoryStatus;
      setStatus(statusTarget, `Could not sign out: ${error.message}`, 'error');
    }
  }

  document.querySelector('#signout-button').addEventListener('click', signOut);
  document.querySelector('#pending-signout-button').addEventListener('click', signOut);

  document.querySelector('#refresh-button').addEventListener('click', loadProfiles);
  document.querySelector('#refresh-requests-button').addEventListener('click', loadMembershipRequests);
  addProfileButton?.addEventListener('click', () => {
    setFormMode();
    athleteForm.hidden = false;
    addProfileButton.hidden = true;
    athleteForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    athleteForm.elements.namedItem('full_name').focus();
  });
  for (const [category, button] of addRecordButtons) {
    button.addEventListener('click', () => {
      recordCategoryTabs.querySelector(`[data-record-category="${category}"]`).click();
      const form = recordForms.get(category);
      resetRecordForm(form);
      form.elements.namedItem('team').value = selectedAdminRecordTeams.get(category) ?? 'boys';
      const teamLabel = form.querySelector('[data-record-form-team]');
      if (teamLabel) teamLabel.textContent = form.elements.namedItem('team').value === 'boys' ? 'Boys' : 'Girls';
      form.hidden = false;
      button.hidden = true;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (category === 'other' ? form.elements.namedItem('record_type') : form.elements.namedItem('event')).focus();
    });
  }
  if (refreshRecordsButton) refreshRecordsButton.addEventListener('click', loadAthleticsRecords);
  if (refreshAdminRecordsButton) refreshAdminRecordsButton.addEventListener('click', loadAthleticsRecords);
  if (refreshPersonalBestsButton) refreshPersonalBestsButton.addEventListener('click', loadPersonalBests);
  if (refreshPersonalBestAdminButton) refreshPersonalBestAdminButton.addEventListener('click', loadPersonalBests);
  cancelEditButton.addEventListener('click', () => setFormMode());

  athleteForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    const formData = new FormData(event.currentTarget);
    const photoUrl = String(formData.get('photo_url')).trim();
    if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
      setStatus(formStatus, 'Photo URL must begin with http:// or https://.', 'error');
      return;
    }

    const profile = {
      full_name: String(formData.get('full_name')).trim(),
      team: String(formData.get('team')),
      event: String(formData.get('event')).trim() || null,
      batch: String(formData.get('batch')).trim() || null,
      photo_url: photoUrl || null,
      bio: String(formData.get('bio')).trim() || null,
    };
    const profileId = String(formData.get('id'));
    if (currentRole === 'member' && !profileId) {
      profile.full_name = profile.full_name || currentUserName.trim();
      if (!profile.full_name) {
        setStatus(formStatus, 'Enter your full name before saving your profile.', 'error');
        return;
      }
      profile.owner_user_id = currentUserId;
    }
    submitButton.disabled = true;
    setStatus(formStatus, profileId ? 'Updating profile…' : 'Saving profile…');
    let result;
    if (profileId) {
      let query = supabaseClient.from('athletes').update(profile).eq('id', profileId);
      if (currentRole === 'member') query = query.eq('owner_user_id', currentUserId);
      result = await query;
    } else {
      result = await supabaseClient.from('athletes').insert(profile);
    }
    submitButton.disabled = false;

    if (result.error) {
      console.error('Unable to save athlete profile.', result.error);
      setStatus(formStatus, `Could not save profile: ${result.error.message}`, 'error');
      return;
    }

    setFormMode();
    await loadProfiles();
    setStatus(isAdminPage ? directoryStatus : formStatus, 'Profile saved.', 'success');
  });

  if (personalBestForm) {
    personalBestSharingToggle?.addEventListener('change', savePersonalBestSharingPreference);
    personalBestForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!['member', 'admin'].includes(currentRole)) {
        setStatus(personalBestFormStatus, 'Sign in with an approved team or admin account to manage personal bests.', 'error');
        return;
      }

      const formData = new FormData(personalBestForm);
      const personalBest = {
        event: String(formData.get('event')),
        performance: String(formData.get('performance')).trim(),
        achieved_on: String(formData.get('achieved_on')) || null,
        note: String(formData.get('note')).trim(),
      };
      const personalBestId = String(formData.get('id'));
      if (!personalBestId) personalBest.owner_user_id = currentUserId;
      const submitButton = personalBestForm.querySelector('[type="submit"]');
      submitButton.disabled = true;
      setStatus(personalBestFormStatus, personalBestId ? 'Updating personal best…' : 'Saving personal best…');
      let query;
      if (personalBestId) {
        query = supabaseClient.from('athlete_personal_bests').update(personalBest)
          .eq('id', personalBestId);
        if (currentRole !== 'admin') query = query.eq('owner_user_id', currentUserId);
        query = query.select('id').maybeSingle();
      } else {
        query = supabaseClient.from('athlete_personal_bests').insert(personalBest);
      }
      let result;
      try {
        result = await query;
      } catch (error) {
        submitButton.disabled = false;
        console.error('The personal-best save request failed.', error);
        setStatus(personalBestFormStatus, `Could not save personal best: ${error.message || 'network error'}`, 'error');
        return;
      }
      submitButton.disabled = false;
      const { data: savedPersonalBest, error } = result;
      if (error) {
        console.error('Unable to save athlete personal best.', error);
        setStatus(personalBestFormStatus, `Could not save personal best: ${error.message}`, 'error');
        return;
      }
      if (personalBestId && !savedPersonalBest) {
        setStatus(personalBestFormStatus, 'No personal best was updated. Refresh the list and check that you have permission to edit this entry.', 'error');
        return;
      }

      resetPersonalBestForm();
      setStatus(personalBestFormStatus, personalBestId ? 'Personal best updated.' : 'Personal best saved.', 'success');
      await loadPersonalBests();
    });
    cancelPersonalBestEdit.addEventListener('click', resetPersonalBestForm);
  }

  for (const [category, form] of recordForms) {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (currentRole !== 'admin') {
        setStatus(form.querySelector('[data-record-form-status]'), 'Only an admin can add records.', 'error');
        return;
      }

      const formData = new FormData(form);
      const selectedType = String(formData.get('record_type'));
      const customTypeName = String(formData.get('custom_record_type') ?? '').trim();
      const customTypeSlug = customTypeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const recordType = category === 'other'
        ? selectedType === 'custom'
          ? (/^[a-z][a-z0-9_]{1,39}$/.test(customTypeSlug) ? customTypeSlug : '')
          : selectedType
        : category;
      if (!recordType) {
        setStatus(form.querySelector('[data-record-form-status]'), 'Enter a custom category name using at least two English letters or numbers.', 'error');
        return;
      }
      if (category !== 'other' && recordType !== category) {
        setStatus(form.querySelector('[data-record-form-status]'), 'The selected category does not match this record form. Reopen the category and try again.', 'error');
        return;
      }
      const record = {
        record_type: recordType,
        team: String(formData.get('team')),
        event: String(formData.get('event')),
        athlete: String(formData.get('athlete')).trim(),
        record_label: String(formData.get('record_label')).trim(),
        college: String(formData.get('college')).trim(),
        performance: String(formData.get('performance')).trim(),
      };
      const recordId = String(formData.get('id'));
      const recordTypeLabel = categoryTitle(record.record_type);
      const confirmation = [
        `${recordId ? 'Update' : 'Add'} this ${recordTypeLabel} entry?`,
        '',
        `Team: ${record.team === 'boys' ? 'Boys' : 'Girls'}`,
        `Event: ${record.event}`,
        `Athlete(s): ${record.athlete}`,
        `Year / meet / trial: ${record.record_label}`,
        `College: ${record.college || 'Not provided'}`,
        `Performance: ${record.performance}`,
      ].join('\n');
      if (!window.confirm(confirmation)) {
        setStatus(form.querySelector('[data-record-form-status]'), recordId ? 'Update cancelled; no changes were saved.' : 'Record was not added.');
        return;
      }

      const submitButton = form.querySelector('[type="submit"]');
      submitButton.disabled = true;
      setStatus(form.querySelector('[data-record-form-status]'), recordId ? 'Updating record…' : 'Adding record…');
      const query = recordId
        ? supabaseClient.from('athletics_records').update(record).eq('id', recordId).select('id').maybeSingle()
        : supabaseClient.from('athletics_records').insert(record);
      const { data: savedRecord, error } = await query;
      submitButton.disabled = false;
      if (error) {
        console.error('Unable to save athletics record.', error);
        setStatus(form.querySelector('[data-record-form-status]'), `Could not save record: ${error.message}`, 'error');
        return;
      }
      if (recordId && !savedRecord) {
        console.warn('The athletics record update matched no accessible record.', recordId);
        setStatus(form.querySelector('[data-record-form-status]'), 'No record was updated. Refresh the records and check that you are signed in as an admin.', 'error');
        return;
      }

      resetRecordForm(form);
      await loadAthleticsRecords();
      setStatus(recordListStatuses.get(category), recordId ? 'Record updated.' : 'Record added.', 'success');
    });
    form.querySelector('[data-cancel-record-form]').addEventListener('click', () => resetRecordForm(form));
  }

  async function deleteProfile(id, name) {
    if (!window.confirm(`Delete ${name}'s athlete profile? This cannot be undone.`)) return;
    const { error } = await supabaseClient.from('athletes').delete().eq('id', id);
    if (error) {
      console.error('Unable to delete athlete profile.', error);
      setStatus(directoryStatus, `Could not delete profile: ${error.message}`, 'error');
      return;
    }
    if (athleteForm.elements.namedItem('id').value === id) setFormMode();
    await loadProfiles();
    setStatus(directoryStatus, `${name}'s profile was deleted.`);
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => {
      handleSession(session).catch(error => {
        console.error('Unable to initialize the athlete profile session.', error);
        showLogin(`Unable to check the signed-in session: ${error.message}`);
      });
    }, 0);
  });

  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Unable to read the signed-in session.', error);
      showLogin(`Unable to read the signed-in session: ${error.message}`);
      return;
    }
    return handleSession(data.session);
  }).catch(error => {
    console.error('Unable to initialize athlete profile access.', error);
    showLogin(`Unable to initialize login: ${error.message}`);
  });
}
