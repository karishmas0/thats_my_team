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
const signupForm = document.querySelector('#signup-form');
const authModeToggle = document.querySelector('#auth-mode-toggle');
const loginModeToggle = document.querySelector('#login-mode-toggle');
const membershipPending = document.querySelector('#membership-pending');
const athleteForm = document.querySelector('#athlete-form');
const athleteList = document.querySelector('#athlete-list');
const personalBestSection = document.querySelector('#personal-bests');
const personalBestForm = document.querySelector('#personal-best-form');
const personalBestFormStatus = document.querySelector('#personal-best-form-status');
const personalBestSubmitLabel = document.querySelector('.personal-best-submit-label');
const cancelPersonalBestEdit = document.querySelector('#cancel-personal-best-edit');
const myPersonalBestList = document.querySelector('#my-personal-best-list');
const myPersonalBestCount = document.querySelector('#my-personal-best-count');
const myPersonalBestsStatus = document.querySelector('#my-personal-bests-status');
const teamPersonalBestList = document.querySelector('#team-personal-best-list');
const teamPersonalBestsStatus = document.querySelector('#team-personal-bests-status');
const personalBestAdmin = document.querySelector('#personal-best-admin');
const personalBestAdminList = document.querySelector('#personal-best-admin-list');
const personalBestAdminStatus = document.querySelector('#personal-best-admin-status');
const formStatus = document.querySelector('#form-status');
const directoryStatus = document.querySelector('#directory-status');
const directoryCount = document.querySelector('#directory-count');
const cancelEditButton = document.querySelector('#cancel-edit-button');
const membershipAdmin = document.querySelector('#membership-admin');
const membershipRequestList = document.querySelector('#membership-request-list');
const membershipRequestCount = document.querySelector('#membership-request-count');
const membershipStatus = document.querySelector('#membership-status');
const profileEditor = document.querySelector('#profile-editor');
const adminDashboardLink = document.querySelector('#admin-dashboard-link');
const recordAdmin = document.querySelector('#record-admin');
const recordForm = document.querySelector('#record-form');
const recordFormStatus = document.querySelector('#record-form-status');
const adminRecordList = document.querySelector('#admin-record-list');
const adminRecordCount = document.querySelector('#admin-record-count');
const adminRecordsStatus = document.querySelector('#admin-records-status');
const recordsStatus = document.querySelector('#records-status');
const cancelRecordEditButton = document.querySelector('#cancel-record-edit-button');
const refreshRecordsButton = document.querySelector('#refresh-records-button');
const refreshAdminRecordsButton = document.querySelector('#refresh-admin-records-button');
const refreshPersonalBestsButton = document.querySelector('#refresh-personal-bests');
const refreshPersonalBestAdminButton = document.querySelector('#refresh-personal-best-admin');
const profileRecordMenu = document.querySelector('#profile-record-menu');
const profileRecordMenuOptions = document.querySelector('#profile-record-menu-options');
const profileRecordSelected = document.querySelector('#profile-record-selected');
const profileRecordRows = document.querySelector('#profile-record-rows');
const profileBoysTab = document.querySelector('#profile-boys-tab');
const profileGirlsTab = document.querySelector('#profile-girls-tab');
const customRecordTypeField = document.querySelector('#custom-record-type-field');
const customRecordTypeInput = recordForm?.elements.namedItem('custom_record_type');
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

customRecordTypeField?.setAttribute('hidden', '');
recordForm?.elements.namedItem('record_type').addEventListener('change', event => {
  const isCustom = event.currentTarget.value === 'custom';
  customRecordTypeField.hidden = !isCustom;
  customRecordTypeInput.required = isCustom;
  if (isCustom) customRecordTypeInput.focus();
});

function setStatus(element, message, state = '') {
  element.textContent = message;
  element.dataset.state = state;
}

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

  function showLogin(message = '') {
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

    athleteList.replaceChildren(...data.map(makeProfileCard));
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

  function resetRecordForm() {
    if (!recordForm) return;
    recordForm.reset();
    recordForm.elements.namedItem('id').value = '';
    customRecordTypeField.hidden = true;
    customRecordTypeInput.required = false;
    recordForm.querySelector('.record-submit-label').textContent = 'Add record';
    cancelRecordEditButton.hidden = true;
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
      recordForm.elements.namedItem('id').value = record.id;
      ['team', 'record_type', 'event', 'athlete', 'record_label', 'college', 'performance'].forEach(field => {
        if (field === 'record_type') {
          const categoryInput = recordForm.elements.namedItem(field);
          const isBuiltIn = [...categoryInput.options].some(option => option.value === record.record_type);
          categoryInput.value = isBuiltIn ? record.record_type : 'custom';
          customRecordTypeInput.value = isBuiltIn ? '' : categoryTitle(record.record_type);
          customRecordTypeField.hidden = isBuiltIn;
          customRecordTypeInput.required = !isBuiltIn;
        } else {
          recordForm.elements.namedItem(field).value = record[field] ?? '';
        }
      });
      recordForm.querySelector('.record-submit-label').textContent = 'Update record';
      cancelRecordEditButton.hidden = false;
      recordForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteAthleticsRecord(record));
    actions.append(editButton, deleteButton);
    card.append(details, actions);
    return card;
  }

  async function loadAthleticsRecords() {
    if (recordsStatus) setStatus(recordsStatus, 'Loading all team records…');
    if (adminRecordsStatus) setStatus(adminRecordsStatus, 'Loading saved records…');
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
      if (adminRecordsStatus) setStatus(adminRecordsStatus, message, 'error');
      return;
    }

    profileRecords = data;
    renderProfileRecords();
    const recordCount = profileRecords.length;
    if (recordsStatus) setStatus(recordsStatus, `${recordCount} total ${recordCount === 1 ? 'record' : 'records'}`);
    if (adminRecordList) {
      adminRecordList.replaceChildren(...data.map(makeAdminRecordCard));
      adminRecordCount.textContent = `${data.length} ${data.length === 1 ? 'record' : 'records'} · edit or remove any record`;
      setStatus(adminRecordsStatus, data.length ? '' : 'No admin-managed records yet.');
    }
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
    meta.textContent = [ownerName, achievedDate, record.share_with_team ? 'Shared with team' : 'Private'].filter(Boolean).join(' · ');
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
        personalBestForm.elements.namedItem('share_with_team').checked = record.share_with_team;
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
      .select('id, owner_user_id, event, performance, achieved_on, note, share_with_team, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Unable to load athlete personal bests.', error);
      const message = `Could not load personal bests: ${error.message}. The personal-best database migration may need to be run.`;
      if (myPersonalBestsStatus) setStatus(myPersonalBestsStatus, message, 'error');
      if (teamPersonalBestsStatus) setStatus(teamPersonalBestsStatus, message, 'error');
      if (personalBestAdminStatus) setStatus(personalBestAdminStatus, message, 'error');
      return;
    }

    if (isAdminPage) {
      const { data: members, error: memberError } = await supabaseClient
        .from('athlete_members')
        .select('user_id, full_name');
      if (memberError) {
        console.error('Unable to load personal-best owner names.', memberError);
        setStatus(personalBestAdminStatus, `Personal bests loaded, but athlete names could not be loaded: ${memberError.message}`, 'error');
      }
      const memberNames = new Map((members ?? []).map(member => [member.user_id, member.full_name]));
      personalBestAdminList.replaceChildren(...data.map(record => makePersonalBestCard(record, {
        ownerName: memberNames.get(record.owner_user_id) || 'Team member',
        canDelete: true,
        isAdmin: true,
      })));
      if (!memberError) {
        setStatus(personalBestAdminStatus, data.length
          ? `${data.length} ${data.length === 1 ? 'personal best' : 'personal bests'} · private and team-shared`
          : 'No athlete personal bests have been submitted yet.');
      }
      return;
    }

    const ownRecords = data.filter(record => record.owner_user_id === currentUserId);
    const sharedRecords = data.filter(record => record.owner_user_id !== currentUserId && record.share_with_team);
    myPersonalBestList.replaceChildren(...ownRecords.map(record => makePersonalBestCard(record, {
      canEdit: true,
      canDelete: true,
    })));
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
    teamPersonalBestList.replaceChildren(...sharedRecords.map(record => makePersonalBestCard(record, {
      ownerName: memberNames.get(record.owner_user_id) || 'Team member',
    })));
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
      setStatus(adminRecordsStatus, `Could not delete record: ${error.message}`, 'error');
      return;
    }
    if (recordForm.elements.namedItem('id').value === record.id) resetRecordForm();
    await loadAthleticsRecords();
    setStatus(adminRecordsStatus, 'Record deleted.');
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
    membershipRequestList.replaceChildren();
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
      authCard.hidden = true;
      membershipPending.hidden = true;
      athleteDashboard.hidden = false;
      membershipAdmin.hidden = !isAdminPage;
      if (recordAdmin) recordAdmin.hidden = !isAdminPage;
      if (personalBestAdmin) personalBestAdmin.hidden = !isAdminPage;
      if (personalBestSection) personalBestSection.hidden = true;
      if (adminDashboardLink) adminDashboardLink.hidden = isAdminPage;
      document.querySelector('.dashboard-heading .eyebrow').lastChild.textContent = isAdminPage
        ? ' ATHLETICS OPERATIONS · ADMIN'
        : ' TEAM DIRECTORY · ADMIN';
      document.querySelector('.dashboard-heading h2').textContent = isAdminPage
        ? 'Team administration.'
        : 'Manage athlete profiles.';
      profileEditor.hidden = false;
      setFormMode();
      const tasks = [loadProfiles(), loadAthleticsRecords()];
      if (isAdminPage) tasks.push(loadMembershipRequests(), loadPersonalBests());
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
    setStatus(formStatus, 'Profile saved.', 'success');
    await loadProfiles();
  });

  if (personalBestForm) {
    personalBestForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (currentRole !== 'member') {
        setStatus(personalBestFormStatus, 'Only an approved athlete can add personal bests.', 'error');
        return;
      }

      const formData = new FormData(personalBestForm);
      const personalBest = {
        owner_user_id: currentUserId,
        event: String(formData.get('event')),
        performance: String(formData.get('performance')).trim(),
        achieved_on: String(formData.get('achieved_on')) || null,
        note: String(formData.get('note')).trim(),
        share_with_team: formData.get('share_with_team') === 'on',
      };
      const personalBestId = String(formData.get('id'));
      const submitButton = personalBestForm.querySelector('[type="submit"]');
      submitButton.disabled = true;
      setStatus(personalBestFormStatus, personalBestId ? 'Updating personal best…' : 'Saving personal best…');
      let query = personalBestId
        ? supabaseClient.from('athlete_personal_bests').update(personalBest)
          .eq('id', personalBestId)
          .eq('owner_user_id', currentUserId)
        : supabaseClient.from('athlete_personal_bests').insert(personalBest);
      const { error } = await query;
      submitButton.disabled = false;
      if (error) {
        console.error('Unable to save athlete personal best.', error);
        setStatus(personalBestFormStatus, `Could not save personal best: ${error.message}`, 'error');
        return;
      }

      resetPersonalBestForm();
      setStatus(personalBestFormStatus, personalBestId ? 'Personal best updated.' : 'Personal best saved.', 'success');
      await loadPersonalBests();
    });
    cancelPersonalBestEdit.addEventListener('click', resetPersonalBestForm);
  }

  if (recordForm) {
    recordForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (currentRole !== 'admin') {
        setStatus(recordFormStatus, 'Only an admin can add records.', 'error');
        return;
      }

      const formData = new FormData(recordForm);
      const selectedType = String(formData.get('record_type'));
      const customTypeName = String(formData.get('custom_record_type') ?? '').trim();
      const customTypeSlug = customTypeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const recordType = selectedType === 'custom'
        ? (/^[a-z][a-z0-9_]{1,39}$/.test(customTypeSlug) ? customTypeSlug : '')
        : selectedType;
      if (!recordType) {
        setStatus(recordFormStatus, 'Enter a custom category name using at least two English letters or numbers.', 'error');
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
        setStatus(recordFormStatus, recordId ? 'Update cancelled; no changes were saved.' : 'Record was not added.');
        return;
      }

      const submitButton = recordForm.querySelector('[type="submit"]');
      submitButton.disabled = true;
      setStatus(recordFormStatus, recordId ? 'Updating record…' : 'Adding record…');
      const query = recordId
        ? supabaseClient.from('athletics_records').update(record).eq('id', recordId)
        : supabaseClient.from('athletics_records').insert(record);
      const { error } = await query;
      submitButton.disabled = false;
      if (error) {
        console.error('Unable to save athletics record.', error);
        setStatus(recordFormStatus, `Could not save record: ${error.message}`, 'error');
        return;
      }

      resetRecordForm();
      setStatus(recordFormStatus, recordId ? 'Record updated.' : 'Record added.', 'success');
      await loadAthleticsRecords();
      setStatus(adminRecordsStatus, recordId ? 'Record updated.' : 'Record added.');
    });
    cancelRecordEditButton.addEventListener('click', resetRecordForm);
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
