document.getElementById('profile-open').addEventListener('click', () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  document.getElementById('profile-name').textContent = user.name || '—';
  document.getElementById('profile-email').textContent = user.email || '—';
  document.getElementById('avatar-initial').textContent = (user.name || '?')[0].toUpperCase();
  document.getElementById('profile-avatar').textContent = (user.name || '?')[0].toUpperCase();
  document.getElementById('profile-account-no').textContent = (user.id || '').slice(-6).toUpperCase() || '—';
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