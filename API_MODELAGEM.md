# Modelagem da API REST — Gestão de Usuários

## Visão geral

API REST responsável pelo cadastro, consulta, atualização e exclusão de usuários, protegida por autenticação JWT e autorização baseada em perfis (RBAC).

**URL base:** `http://localhost:3000/api`

**Formato de dados:** JSON

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| Administrador | Criar, consultar, atualizar e excluir qualquer usuário. |
| Operador | Consultar usuários e atualizar informações de usuários, sem criar ou excluir. |
| Cliente | Consultar somente os próprios dados. |

## Autenticação

As rotas protegidas devem receber o token JWT no cabeçalho HTTP:

```http
Authorization: Bearer <token_jwt>
```

## Endpoints

| Método | Endpoint | Finalidade | Acesso | Respostas esperadas |
|---|---|---|---|---|
| POST | `/auth/login` | Autenticar o usuário com e-mail e senha e gerar um JWT. | Público | `200 OK`, `401 Unauthorized`, `400 Bad Request` |
| POST | `/usuarios` | Cadastrar um novo usuário. | Administrador | `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict` |
| GET | `/usuarios` | Listar todos os usuários cadastrados. | Administrador e Operador | `200 OK`, `401 Unauthorized`, `403 Forbidden` |
| GET | `/usuarios/{id}` | Consultar um usuário específico. Clientes só podem consultar seu próprio identificador. | Administrador, Operador e Cliente (próprios dados) | `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| PUT | `/usuarios/{id}` | Atualizar nome, e-mail e perfil de um usuário. | Administrador e Operador | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` |
| DELETE | `/usuarios/{id}` | Excluir um usuário. | Administrador | `204 No Content`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |

## Estrutura dos dados

### Usuário

```json
{
  "id": 1,
  "nome": "Ana Silva",
  "email": "ana@email.com",
  "perfil": "ADMIN"
}
```

> A senha jamais deve ser retornada nas respostas da API.

### Cadastro — `POST /usuarios`

```json
{
  "nome": "Ana Silva",
  "email": "ana@email.com",
  "senha": "SenhaForte@123",
  "perfil": "ADMIN"
}
```

Perfis aceitos: `ADMIN`, `OPERADOR` e `CLIENTE`.

### Login — `POST /auth/login`

```json
{
  "email": "ana@email.com",
  "senha": "SenhaForte@123"
}
```

Resposta de sucesso:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiraEm": "1h"
}
```

### Atualização — `PUT /usuarios/{id}`

```json
{
  "nome": "Ana Souza",
  "email": "ana.souza@email.com",
  "perfil": "OPERADOR"
}
```

## Regras complementares

- E-mails são únicos no sistema.
- Senhas devem ser armazenadas somente como hash (por exemplo, bcrypt).
- Somente o administrador pode criar usuários e atribuir ou modificar perfis.
- Como medida adicional de segurança, a implementação pode restringir o operador a alterar somente nome e e-mail, mantendo a mudança de perfil exclusiva ao administrador.
- Um cliente não pode listar usuários, editar outros usuários nem removê-los.

## Códigos de resposta

| Código | Significado neste projeto |
|---|---|
| `200 OK` | Requisição realizada com sucesso. |
| `201 Created` | Usuário criado com sucesso. |
| `204 No Content` | Usuário excluído com sucesso, sem corpo na resposta. |
| `400 Bad Request` | Dados ausentes ou inválidos. |
| `401 Unauthorized` | Token ausente, inválido, expirado ou credenciais incorretas. |
| `403 Forbidden` | Usuário autenticado, mas sem permissão para a operação. |
| `404 Not Found` | Usuário solicitado não existe. |
| `409 Conflict` | E-mail já está cadastrado. |
