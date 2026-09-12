/**
 * main.js — app init.
 * Shows the auth screen first; once logged in, reveals the real app
 * and loads transactions/forecast for that user.
 */

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');

  function updateIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggle.textContent = isDark ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon();
  });

  updateIcon();
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden-app');
  document.querySelector('.app-header').classList.remove('hidden-app');
  document.querySelector('.layout').classList.remove('hidden-app');
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden-app');
  document.querySelector('.app-header').classList.add('hidden-app');
  document.querySelector('.layout').classList.add('hidden-app');
}

let appInitialized = false;

function onAuthSuccess() {
  showApp();
  if (!appInitialized) {
    initTransactions();
    initForecast();
    appInitialized = true;
  } else {
    refreshTransactions();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initAuth();

  // Already logged in from a previous action this session? Skip straight to the app.
  if (getToken()) {
    onAuthSuccess();
  } else {
    showAuthScreen();
  }
});