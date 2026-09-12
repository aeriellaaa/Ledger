/**
 * auth.js — login/signup UI logic.
 * Actual API calls (apiLogin, apiSignup) and token storage live in api.js,
 * since that file loads first and other scripts depend on it.
 */

function initAuthTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const isLogin = tab.dataset.authTab === 'login';
      loginForm.hidden = !isLogin;
      signupForm.hidden = isLogin;
    });
  });
}

function showAuthError(el, message) {
  el.hidden = false;
  el.textContent = message;
}

function clearAuthError(el) {
  el.hidden = true;
  el.textContent = '';
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  const errorsEl = document.getElementById('login-errors');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthError(errorsEl);

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const submitBtn = document.getElementById('login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    try {
     const { token, user } = await apiLogin(email, password);
    setToken(token);
    sessionStorage.setItem('user', JSON.stringify(user));
    onAuthSuccess();
    } catch (err) {
      showAuthError(errorsEl, err.messages ? err.messages.join(' ') : 'Login failed.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
}

function initSignupForm() {
  const form = document.getElementById('signup-form');
  const errorsEl = document.getElementById('signup-errors');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthError(errorsEl);

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    const submitBtn = document.getElementById('signup-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing up…';

    try {
      const { token, user } = await apiSignup(name, email, password);
     setToken(token);
     sessionStorage.setItem('user', JSON.stringify(user));
     onAuthSuccess();
    } catch (err) {
      showAuthError(errorsEl, err.messages ? err.messages.join(' ') : 'Signup failed.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign up';
    }
  });
}

function initAuth() {
  initAuthTabs();
  initLoginForm();
  initSignupForm();
}