const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação ausente.' });
  }

  const token = authorization.substring(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

function authorize(...profiles) {
  return (req, res, next) => {
    if (!profiles.includes(req.user.perfil)) {
      return res.status(403).json({ erro: 'Você não possui permissão para esta operação.' });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
