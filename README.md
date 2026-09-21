# API REST Segura para Gestão de Usuários

## Sobre o projeto

Este projeto foi desenvolvido para a disciplina de Segurança Web. Ele apresenta uma aplicação para gerenciamento de usuários com uma API REST e uma interface web simples.

O sistema permite cadastrar, listar, editar e excluir usuários. Também possui login com JWT e controle de acesso por perfis: Administrador, Operador e Cliente.

## Tecnologias utilizadas

- Node.js
- Express
- JavaScript
- HTML e CSS
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- dotenv

## Funcionalidades

- Login por e-mail e senha;
- Geração de token JWT;
- Cadastro de usuários;
- Listagem de usuários;
- Consulta de usuário por ID;
- Atualização de usuários;
- Exclusão de usuários;
- Controle de permissões por perfil;
- Senhas protegidas com hash bcrypt;
- Interface web para demonstrar a API.

## Perfis do sistema

| Perfil | Permissões |
|---|---|
| Administrador | Acesso total: criar, consultar, editar e excluir. |
| Operador | Pode consultar e atualizar nome/e-mail. |
| Cliente | Pode visualizar somente os próprios dados. |

## Como instalar

É necessário ter o Node.js instalado no computador.

1. Abra o terminal na pasta do projeto.
2. Instale as dependências:

```powershell
npm install
```

3. Crie um arquivo chamado `.env` a partir do arquivo `.env.example`.
4. No arquivo `.env`, informe uma chave JWT. Exemplo:

```env
PORT=3000
JWT_SECRET=uma-chave-longa-e-secreta-para-desenvolvimento
JWT_EXPIRES_IN=1h
```

## Como executar

No terminal, execute:

```powershell
npm start
```

Depois, abra o navegador no endereço:

```text
http://localhost:3000
```

## Usuário inicial para teste

Na primeira execução, o sistema cria um administrador automaticamente.

| Campo | Valor |
|---|---|
| E-mail | `admin@exemplo.com` |
| Senha | `Admin@123` |
| Perfil | Administrador |

Este usuário é apenas para demonstração local. Em um sistema real, essa senha deve ser alterada ou criada de forma segura.

## Como testar

1. Inicie o servidor com `npm start`.
2. Abra `http://localhost:3000`.
3. Entre usando o usuário inicial.
4. Cadastre usuários com os perfis Cliente e Operador.
5. Teste a listagem, edição e exclusão com o administrador.
6. Faça login como Cliente e veja que somente os próprios dados podem ser consultados.

Também é possível testar a API em ferramentas como Postman ou Insomnia. A documentação dos endpoints está no arquivo [DOCUMENTACAO_API.md](DOCUMENTACAO_API.md).

## Estrutura das pastas

```text
.
├── data/           # arquivo JSON usado para guardar os usuários localmente
├── public/         # interface web (HTML, CSS e JavaScript)
├── src/            # código do servidor e regras de segurança
├── DOCUMENTACAO_API.md
├── API_MODELAGEM.md
└── package.json
```

## Segurança aplicada

- Senhas não são salvas em texto puro; foi usado bcrypt.
- Rotas importantes exigem token JWT.
- O token expira após 1 hora.
- Existem permissões diferentes para cada perfil.
- A senha não é devolvida nas respostas da API.
- O sistema valida e-mail, senha, perfil e duplicidade de e-mail.

## Observação

O projeto foi criado para uma atividade acadêmica e funciona localmente. Para publicação em produção seriam necessárias melhorias, como HTTPS, banco de dados, controle de tentativas de login e configuração segura das variáveis de ambiente.
