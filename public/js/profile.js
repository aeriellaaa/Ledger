// Profile screen: open/close, populate from stored user, and log out.
// Assumes login/signup success handlers in auth.js store the logged-in
// user object as sessionStorage 'user' (JSON string) alongside the token.
// If your auth.js uses a different key, update the two sessionStorage
// lines below to match.

document.getElementById('profile-open').addEventListener('click', () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  const initial = (user.name || '?')[0].toUpperCase();

  document.getElementById('profile-name').textContent = user.name || '—';
  document.getElementById('profile-email').textContent = user.email || '—';
  document.getElementById('avatar-initial').textContent = initial;
  document.getElementById('profile-avatar').textContent = initial;
  document.getElementById('profile-account-no').textContent =
    (user.id || '').toString().slice(-6).toUpperCase() || '—';
  document.getElementById('profile-since').textContent = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';
  document.getElementById('profile-theme').textContent =
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'Dark' : 'Light';

  document.getElementById('profile-screen').hidden = false;
});

document.getElementById('profile-close').addEventListener('click', () => {
  document.getElementById('profile-screen').hidden = true;
});

document.getElementById('profile-logout').addEventListener('click', () => {
  sessionStorage.clear();
  location.reload();
});

document.getElementById('header-logout').addEventListener('click', () => {
  sessionStorage.clear();
  location.reload();
});

// Password show/hide toggles on the auth screen.
document.querySelectorAll('.password-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.textContent = showing ? '👁' : '🙈';
  });
});

// Header date stamp.
const headerDateEl = document.getElementById('header-date');
if (headerDateEl) {
  headerDateEl.textContent = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}