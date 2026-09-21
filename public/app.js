const API = '/api';
let token = sessionStorage.getItem('token');
let currentUser = token ? JSON.parse(sessionStorage.getItem('currentUser') || 'null') : null;
let editingId = null;

const $ = (selector) => document.querySelector(selector);
const responseBox = $('#api-response');

function showResponse(data) { responseBox.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2); }
function headers() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }; }
function profileLabel(profile) { return ({ ADMIN:'Administrador', OPERADOR:'Operador', CLIENTE:'Cliente' })[profile] || profile; }
function isAdmin() { return currentUser?.perfil === 'ADMIN'; }
function canEdit() { return ['ADMIN', 'OPERADOR'].includes(currentUser?.perfil); }

function finishGoogleLogin() {
  const oauthToken = new URLSearchParams(window.location.hash.substring(1)).get('oauth_token');
  if (!oauthToken) return;
  try {
    const payload = JSON.parse(atob(oauthToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    token = oauthToken;
    currentUser = { id: payload.id, nome: payload.nome, perfil: payload.perfil };
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    history.replaceState(null, '', window.location.pathname);
  } catch { showResponse('Não foi possível concluir o login com Google.'); }
}

async function request(url, options = {}) {
  const response = await fetch(`${API}${url}`, options);
  const content = response.status === 204 ? null : await response.json().catch(() => ({ erro: 'Resposta inválida.' }));
  showResponse({ status: response.status, resposta: content });
  if (!response.ok) throw new Error(content?.erro || content?.erros?.join(' ') || 'Não foi possível concluir a operação.');
  return content;
}

function setLoggedIn(loggedIn) {
  $('#login-section').classList.toggle('hidden', loggedIn);
  $('#app-section').classList.toggle('hidden', !loggedIn);
  $('#logout-button').classList.toggle('hidden', !loggedIn);
  if (!loggedIn) return;
  $('#session-user').textContent = currentUser.nome;
  $('#session-profile').textContent = profileLabel(currentUser.perfil);
  $('#create-section').classList.toggle('hidden', !isAdmin());
}

async function loadUsers() {
  try {
    let users;
    if (currentUser.perfil === 'CLIENTE') users = [await request(`/usuarios/${currentUser.id}`, { headers: headers() })];
    else users = await request('/usuarios', { headers: headers() });
    renderUsers(users);
  } catch (error) { $('#list-hint').textContent = error.message; }
}

function renderUsers(users) {
  const body = $('#users-body'); body.replaceChildren();
  $('#list-hint').textContent = `${users.length} usuário(s) encontrado(s).`;
  users.forEach((user) => {
    const row = document.createElement('tr');
    [user.nome, user.email, profileLabel(user.perfil)].forEach((value) => { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); });
    const actions = document.createElement('td');
    if (canEdit()) { const edit = document.createElement('button'); edit.className = 'small secondary'; edit.textContent = 'Editar'; edit.onclick = () => startEdit(user); actions.append(edit); }
    if (isAdmin()) { const remove = document.createElement('button'); remove.className = 'small danger'; remove.textContent = 'Excluir'; remove.onclick = () => deleteUser(user); actions.append(remove); }
    row.append(actions); body.append(row);
  });
}

function startEdit(user) {
  editingId = user.id; $('#form-title').textContent = `Editar: ${user.nome}`; $('#save-button').textContent = 'Salvar alterações'; $('#cancel-button').classList.remove('hidden');
  $('#user-name').value = user.nome; $('#user-email').value = user.email; $('#user-password').required = false; $('#user-password').value = '';
  $('#profile-field').classList.toggle('hidden', !isAdmin()); $('#user-profile').value = user.perfil; $('#create-section').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function cancelEdit() { editingId = null; $('#user-form').reset(); $('#form-title').textContent = 'Cadastrar usuário'; $('#save-button').textContent = 'Cadastrar'; $('#cancel-button').classList.add('hidden'); $('#user-password').required = true; $('#profile-field').classList.remove('hidden'); }

async function deleteUser(user) {
  if (!confirm(`Excluir ${user.nome}? Esta ação não pode ser desfeita.`)) return;
  try { await request(`/usuarios/${user.id}`, { method:'DELETE', headers:headers() }); await loadUsers(); } catch (error) { alert(error.message); }
}

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const data = await request('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:$('#login-email').value, senha:$('#login-password').value }) });
    token = data.token; currentUser = data.usuario; sessionStorage.setItem('token', token); sessionStorage.setItem('currentUser', JSON.stringify(currentUser)); setLoggedIn(true); await loadUsers();
  } catch (error) { alert(error.message); }
});

$('#user-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = { nome:$('#user-name').value, email:$('#user-email').value, perfil:$('#user-profile').value };
  if (!editingId || $('#user-password').value) payload.senha = $('#user-password').value;
  if (!isAdmin()) delete payload.perfil;
  try { await request(editingId ? `/usuarios/${editingId}` : '/usuarios', { method:editingId ? 'PUT' : 'POST', headers:headers(), body:JSON.stringify(payload) }); cancelEdit(); await loadUsers(); } catch (error) { alert(error.message); }
});

$('#refresh-button').onclick = loadUsers; $('#cancel-button').onclick = cancelEdit;
$('#logout-button').onclick = () => { token = null; currentUser = null; sessionStorage.clear(); cancelEdit(); setLoggedIn(false); showResponse('Sessão encerrada.'); };
finishGoogleLogin();
if (token && currentUser) { setLoggedIn(true); loadUsers(); }
