'use strict';

const themeStylesheet = document.querySelector('#theme-stylesheet');
const themeToggle = document.querySelector('#theme-toggle');
const themeToggleLabel = themeToggle.querySelector('.theme-toggle-label');
const themeToggleIcon = themeToggle.querySelector('.theme-toggle-icon');
const resetPasswordForm = document.querySelector('#reset-password-form');
const resetPasswordDescription = document.querySelector('#reset-password-description');
const resetPasswordStatus = document.querySelector('#reset-password-status');
const adminSigninLink = document.querySelector('#admin-signin-link');

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

function setStatus(message, state = '') {
  resetPasswordStatus.textContent = message;
  resetPasswordStatus.dataset.state = state;
}

setTheme(localStorage.getItem('athletics-theme') === 'light' ? 'light' : 'dark');
themeToggle.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
document.querySelector('#year').textContent = new Date().getFullYear();

const config = window.ATHLETICS_SUPABASE_CONFIG;
if (!config?.url || !config.anonKey || !window.supabase?.createClient) {
  resetPasswordDescription.textContent = 'Password recovery is unavailable because Supabase is not configured.';
  setStatus('Check the Supabase configuration and reload this page.', 'error');
} else {
  const supabaseClient = window.supabase.createClient(config.url, config.anonKey);
  let recoverySessionReady = false;

  function enablePasswordReset(session) {
    if (!session) return;
    recoverySessionReady = true;
    resetPasswordDescription.textContent = 'Choose a new password for your account.';
    resetPasswordForm.hidden = false;
    setStatus('');
    resetPasswordForm.elements.namedItem('password').focus();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      enablePasswordReset(session);
    }
  });

  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Unable to verify password recovery session.', error);
      resetPasswordDescription.textContent = 'This password recovery link could not be verified.';
      setStatus(`Could not verify recovery link: ${error.message}`, 'error');
      return;
    }
    if (recoverySessionReady) return;

    const hasRecoveryLink = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    if (hasRecoveryLink && data.session) {
      enablePasswordReset(data.session);
      return;
    }
    resetPasswordDescription.textContent = 'Open the latest password recovery link sent to your email to continue.';
    setStatus('This recovery link is invalid or has expired. Request a new one from the admin sign-in page.', 'error');
    adminSigninLink.hidden = false;
  }).catch(error => {
    console.error('Unable to initialize password recovery.', error);
    resetPasswordDescription.textContent = 'Password recovery could not be initialized.';
    setStatus(`Could not initialize password recovery: ${error instanceof Error ? error.message : String(error)}`, 'error');
  });

  resetPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!recoverySessionReady) {
      setStatus('Open a valid recovery link before setting a new password.', 'error');
      return;
    }

    const passwordInput = resetPasswordForm.elements.namedItem('password');
    const confirmationInput = resetPasswordForm.elements.namedItem('password_confirmation');
    if (passwordInput.value !== confirmationInput.value) {
      setStatus('The passwords do not match. Please check both fields.', 'error');
      confirmationInput.focus();
      return;
    }

    const submitButton = resetPasswordForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setStatus('Saving your new password…');
    try {
      const { error } = await supabaseClient.auth.updateUser({ password: passwordInput.value });
      if (error) {
        setStatus(`Could not update password: ${error.message}`, 'error');
        return;
      }
      resetPasswordForm.reset();
      resetPasswordForm.hidden = true;
      resetPasswordDescription.textContent = 'Your password has been updated.';
      setStatus('You can now continue to admin sign-in.', 'success');
      adminSigninLink.hidden = false;
    } catch (error) {
      console.error('Unable to update account password.', error);
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`Could not update password: ${message}`, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
}
