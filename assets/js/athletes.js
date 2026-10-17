'use strict';

const themeStylesheet = document.querySelector('#theme-stylesheet');
const themeToggle = document.querySelector('#theme-toggle');
const themeToggleLabel = themeToggle.querySelector('.theme-toggle-label');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle-icon');
const authCard = document.querySelector('#auth-card');
const athleteDashboard = document.querySelector('#athlete-dashboard');
const authStatus = document.querySelector('#auth-status');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const authModeToggle = document.querySelector('#auth-mode-toggle');
const loginModeToggle = document.querySelector('#login-mode-toggle');
const membershipPending = document.querySelector('#membership-pending');
const athleteForm = document.querySelector('#athlete-form');
const athleteList = document.querySelector('#athlete-list');
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
const isAdminPage = document.body.dataset.page === 'admin';
let currentRole = '';
let currentUserId = '';
let currentUserName = '';

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
    membershipAdmin.hidden = true;
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
    setStatus(authStatus, message);
  }

  function showMembershipPending(title, message) {
    authCard.hidden = true;
    athleteDashboard.hidden = true;
    membershipPending.hidden = false;
    membershipAdmin.hidden = true;
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
      document.querySelector('.profile-editor-heading p').textContent = currentRole === 'member'
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
        document.querySelector('.profile-editor-heading p').textContent = 'Create your own athlete profile. You can edit it later.';
      } else {
        document.querySelector('.profile-editor-heading p').textContent = 'Build a profile for the team directory.';
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
      showLogin(athleteDashboard.hidden ? authStatus.textContent : '');
      return;
    }

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
      if (adminDashboardLink) adminDashboardLink.hidden = isAdminPage;
      document.querySelector('.dashboard-heading .eyebrow').lastChild.textContent = isAdminPage
        ? ' ATHLETICS OPERATIONS · ADMIN'
        : ' TEAM DIRECTORY · ADMIN';
      document.querySelector('.dashboard-heading h2').textContent = isAdminPage
        ? 'Team administration.'
        : 'Manage athlete profiles.';
      profileEditor.hidden = false;
      setFormMode();
      const tasks = [loadProfiles()];
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
    if (adminDashboardLink) adminDashboardLink.hidden = true;
    document.querySelector('.dashboard-heading .eyebrow').lastChild.textContent = ' TEAM DIRECTORY · MEMBER';
    document.querySelector('.dashboard-heading h2').textContent = 'Athlete profiles.';
    document.querySelector('#directory-title').textContent = 'Team directory';
    profileEditor.hidden = false;
    setFormMode();
    await loadProfiles();
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setStatus(authStatus, 'Signing in…');
    const formData = new FormData(event.currentTarget);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    submitButton.disabled = false;
    if (error) {
      setStatus(authStatus, `Sign-in failed: ${error.message}`, 'error');
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
