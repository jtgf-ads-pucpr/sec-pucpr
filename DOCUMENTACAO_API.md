# Documentação da API — Gestão de Usuários

## 1. Objetivo

Este projeto é uma API REST para gerenciar usuários. Com ela é possível cadastrar, consultar, editar e excluir usuários. A aplicação também possui login com token JWT e controle de acesso por perfil.

A URL base da API, quando o projeto está sendo executado localmente, é:

```text
http://localhost:3000/api
```

Os dados enviados e recebidos estão no formato JSON.

## 2. Endpoints da API

| Método | Endpoint | Finalidade | Respostas principais |
|---|---|---|---|
| POST | `/auth/login` | Faz o login e gera um token JWT. | 200, 400, 401 |
| POST | `/usuarios` | Cadastra um novo usuário. | 201, 400, 401, 403, 409 |
| GET | `/usuarios` | Lista os usuários cadastrados. | 200, 401, 403 |
| GET | `/usuarios/{id}` | Busca um usuário pelo identificador. | 200, 401, 403, 404 |
| PUT | `/usuarios/{id}` | Atualiza os dados de um usuário. | 200, 400, 401, 403, 404, 409 |
| DELETE | `/usuarios/{id}` | Exclui um usuário. | 204, 401, 403, 404 |

### Significado dos códigos de resposta

| Código | Significado |
|---|---|
| 200 OK | A requisição foi realizada com sucesso. |
| 201 Created | Um usuário foi criado com sucesso. |
| 204 No Content | O usuário foi excluído. Não existe conteúdo para retornar. |
| 400 Bad Request | Algum dado enviado está faltando ou é inválido. |
| 401 Unauthorized | A pessoa não enviou token, enviou token inválido/expirado ou informou login incorreto. |
| 403 Forbidden | A pessoa está autenticada, mas não tem autorização para essa ação. |
| 404 Not Found | O usuário procurado não foi encontrado. |
| 409 Conflict | O e-mail informado já está cadastrado. |

## 3. Exemplos de uso

### Login

**POST** `/auth/login`

```json
{
  "email": "admin@exemplo.com",
  "senha": "Admin@123"
}
```

Quando o login estiver correto, a API retorna o token:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiraEm": "1h",
  "usuario": {
    "id": 1,
    "nome": "Administrador Inicial",
    "email": "admin@exemplo.com",
    "perfil": "ADMIN"
  }
}
```

### Envio do token

Para acessar uma rota protegida, é necessário enviar o token no cabeçalho da requisição:

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

### Cadastro de usuário

**POST** `/usuarios`

Somente um administrador pode usar esta rota.

```json
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "senha": "Senha@123",
  "perfil": "CLIENTE"
}
```

### Atualização de usuário

**PUT** `/usuarios/2`

```json
{
  "nome": "Maria da Silva",
  "email": "maria.silva@exemplo.com",
  "perfil": "CLIENTE"
}
```

A senha não aparece em nenhuma resposta da API.

## 4. Autenticação com JWT

JWT significa *JSON Web Token*. Ele é um token usado para identificar o usuário depois do login.

### Como funciona o login

1. O usuário envia e-mail e senha para o endpoint `/auth/login`.
2. O servidor procura o e-mail e compara a senha informada com a senha salva de forma protegida.
3. Se os dados estiverem corretos, o servidor cria um JWT.
4. Nas próximas requisições, o front-end envia o JWT no cabeçalho `Authorization`.
5. A API verifica se o token é válido antes de liberar a rota.

### Informações guardadas no token

O token guarda o ID, o nome e o perfil do usuário. A biblioteca JWT também adiciona a data de emissão e a data de expiração. A senha não é colocada no token.

### Expiração

O token dura **1 hora**. Esse tempo foi escolhido porque deixa o usuário usar o sistema por um período razoável, mas diminui o risco caso o token seja roubado. Depois de uma hora, é necessário fazer login novamente.

## 5. Controle de acesso por perfis (RBAC)

RBAC significa controle de acesso baseado em papéis. No projeto, cada usuário tem um perfil e cada perfil possui permissões diferentes.

| Perfil | Pode fazer |
|---|---|
| Administrador | Criar, listar, consultar, atualizar e excluir qualquer usuário. Também pode alterar perfis. |
| Operador | Listar e consultar usuários. Pode atualizar nome e e-mail, mas não pode criar, excluir ou mudar perfil. |
| Cliente | Pode consultar somente os próprios dados. Não pode listar todos os usuários, criar, editar ou excluir. |

As regras são verificadas no servidor. Então, mesmo que uma pessoa tente chamar uma URL manualmente, a API retorna o erro `403 Forbidden` quando ela não tiver permissão.

## 6. OAuth 2.0 (explicação)

OAuth 2.0 é um protocolo que permite que uma aplicação parceira use recursos de outra aplicação sem receber a senha do usuário.

Neste sistema, um possível funcionamento seria:

1. Uma aplicação parceira pede acesso aos dados do usuário.
2. O usuário é direcionado para uma tela de autorização e escolhe se permite ou não esse acesso.
3. Depois da autorização, a aplicação parceira recebe um token de acesso com permissões limitadas.
4. A aplicação envia esse token para a API ao pedir recursos protegidos.
5. A API valida o token e libera somente o que foi autorizado.

Os principais benefícios são não compartilhar senhas com outras aplicações, poder limitar as permissões e poder cancelar o acesso de uma aplicação parceira depois.

OAuth 2.0 foi explicado na documentação, mas não foi implementado, conforme solicitado no enunciado.

## 7. Análise de segurança

| Risco | Possível problema | Medida usada ou recomendada |
|---|---|---|
| Roubo de token JWT | Outra pessoa pode usar o token para se passar pelo usuário. | Usar HTTPS em produção, token com expiração de 1 hora e não expor o token em locais públicos. |
| Senhas em texto puro | Se o arquivo de dados for acessado, as senhas ficam visíveis. | As senhas são guardadas com hash bcrypt. A senha original não é salva. |
| Acesso a endpoint sem permissão | Um cliente poderia tentar excluir ou visualizar dados de outras pessoas. | A API valida o token e aplica regras RBAC antes de executar a ação. |
| E-mail repetido | Podem existir contas duplicadas e confusão no login. | A API verifica se o e-mail já existe e retorna o código 409. |
| Dados inválidos | Dados errados podem causar problemas na aplicação. | A API valida nome, e-mail, senha e perfil antes de salvar. |

Também foram usadas outras boas práticas: a resposta não devolve a senha, o tamanho do JSON enviado é limitado e o cabeçalho `X-Powered-By` do Express foi desativado.

## 8. Observação sobre produção

Este projeto foi feito para fins acadêmicos e execução local. Em uma aplicação real, seria importante usar banco de dados, HTTPS, variáveis de ambiente seguras, logs, limitação de tentativas de login e uma chave JWT longa e secreta.
