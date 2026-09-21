require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readUsers, saveUsers } = require('./storage');
const { authenticate, authorize } = require('./auth');
const { validateUserInput, publicUser } = require('./validators');

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Crie um arquivo .env a partir de .env.example.');
}

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

    const user = (await readUsers()).find((item) => item.email.toLowerCase() === String(email).toLowerCase());
    if (!user || !(await bcrypt.compare(senha, user.senhaHash))) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, perfil: user.perfil },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpiresIn }
    );
    return res.status(200).json({ token, tipo: 'Bearer', expiraEm: jwtExpiresIn, usuario: publicUser(user) });
  } catch (error) { return next(error); }
});

app.post('/api/usuarios', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const errors = validateUserInput(req.body, { passwordRequired: true });
    if (errors.length) return res.status(400).json({ erros: errors });
    const users = await readUsers();
    const email = req.body.email.trim().toLowerCase();
    if (users.some((user) => user.email === email)) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

    const user = {
      id: users.length ? Math.max(...users.map((item) => item.id)) + 1 : 1,
      nome: req.body.nome.trim(), email, perfil: req.body.perfil || 'CLIENTE',
      senhaHash: await bcrypt.hash(req.body.senha, 12),
      criadoEm: new Date().toISOString()
    };
    users.push(user);
    await saveUsers(users);
    return res.status(201).location(`/api/usuarios/${user.id}`).json(publicUser(user));
  } catch (error) { return next(error); }
});

app.get('/api/usuarios', authenticate, authorize('ADMIN', 'OPERADOR'), async (_req, res, next) => {
  try { return res.status(200).json((await readUsers()).map(publicUser)); }
  catch (error) { return next(error); }
});

app.get('/api/usuarios/:id', authenticate, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = (await readUsers()).find((item) => item.id === id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (req.user.perfil === 'CLIENTE' && req.user.id !== id) {
      return res.status(403).json({ erro: 'Clientes só podem visualizar seus próprios dados.' });
    }
    return res.status(200).json(publicUser(user));
  } catch (error) { return next(error); }
});

app.put('/api/usuarios/:id', authenticate, authorize('ADMIN', 'OPERADOR'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const users = await readUsers();
    const index = users.findIndex((item) => item.id === id);
    if (index === -1) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const candidate = { ...users[index], ...req.body };
    const errors = validateUserInput(candidate);
    if (errors.length) return res.status(400).json({ erros: errors });
    if (req.user.perfil === 'OPERADOR' && req.body.perfil !== undefined) {
      return res.status(403).json({ erro: 'Somente administradores podem alterar perfis.' });
    }
    const email = req.body.email.trim().toLowerCase();
    if (users.some((user) => user.id !== id && user.email === email)) return res.status(409).json({ erro: 'E-mail já cadastrado.' });

    users[index] = { ...users[index], nome: req.body.nome.trim(), email, perfil: req.body.perfil || users[index].perfil };
    await saveUsers(users);
    return res.status(200).json(publicUser(users[index]));
  } catch (error) { return next(error); }
});

app.delete('/api/usuarios/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const users = await readUsers();
    if (!users.some((item) => item.id === id)) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    await saveUsers(users.filter((item) => item.id !== id));
    return res.status(204).send();
  } catch (error) { return next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function seedAdmin() {
  const users = await readUsers();
  if (users.length) return;
  users.push({
    id: 1, nome: 'Administrador Inicial', email: 'admin@exemplo.com', perfil: 'ADMIN',
    senhaHash: await bcrypt.hash('Admin@123', 12), criadoEm: new Date().toISOString()
  });
  await saveUsers(users);
  console.log('Usuário inicial: admin@exemplo.com / Admin@123');
}

seedAdmin().then(() => app.listen(port, () => console.log(`API em http://localhost:${port}/api`)));
