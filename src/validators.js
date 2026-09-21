const profiles = ['ADMIN', 'OPERADOR', 'CLIENTE'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserInput(input, { passwordRequired = false } = {}) {
  const errors = [];
  const { nome, email, senha, perfil } = input;

  if (typeof nome !== 'string' || nome.trim().length < 3) {
    errors.push('Nome deve ter ao menos 3 caracteres.');
  }
  if (typeof email !== 'string' || !emailPattern.test(email)) {
    errors.push('E-mail inválido.');
  }
  if (passwordRequired && (typeof senha !== 'string' || senha.length < 8)) {
    errors.push('Senha deve ter ao menos 8 caracteres.');
  }
  if (perfil !== undefined && !profiles.includes(perfil)) {
    errors.push('Perfil deve ser ADMIN, OPERADOR ou CLIENTE.');
  }
  return errors;
}

function publicUser({ senhaHash, ...user }) {
  return user;
}

module.exports = { profiles, validateUserInput, publicUser };
