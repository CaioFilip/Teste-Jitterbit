API REST para gerenciamento de pedidos (CRUD completo) com autenticação JWT, utilizando PostgreSQL como banco de dados.

🚀 Funcionalidades
✔ Autenticação (JWT)

POST /auth/login → retorna um token JWT para acesso às outras rotas.

✔ Pedidos (Orders)

POST /order → Criar novo pedido

GET /order/:orderId → Buscar pedido pelo número

GET /order/list → Listar todos os pedidos

PUT /order/:orderId → Atualizar pedido

DELETE /order/:orderId → Remover pedido

📂 Estrutura do Projeto
📦 order-api
├── server.js
├── .env
├── package.json
├── database/
│   └── db.js
├── routes/
│   ├── auth.js
│   └── order.js
└── controllers/
    ├── authController.js
    └── orderController.js

🔐 Autenticação JWT

Antes de acessar qualquer rota /order, você deve:

1️⃣ Fazer login
POST http://localhost:3000/auth/login
Body JSON:
{
  "username": "admin",
  "password": "123456"
}

2️⃣ Receber um token como resposta
{
  "token": "eyJhbGciOiJIUz..."
}

3️⃣ Enviar o token nas requisições protegidas

Header:

Authorization: Bearer SEU_TOKEN_AQUI

🧪 Coleção Postman

A API usa os seguintes endpoints:

Auth
Método	Rota	Descrição
POST	/auth/login	Gera token JWT
Order
Método	Rota	Descrição
POST	/order	Criar pedido
GET	/order/:orderId	Buscar pedido
GET	/order/list	Listar pedidos
PUT	/order/:orderId	Atualizar pedido
DELETE	/order/:orderId	Deletar pedido
🛠 Rodando Localmente
1. Instale as dependências
npm install

2. Configure o arquivo .env
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=orders_db
PGUSER=usuario
PGPASSWORD=1234
JWT_SECRET=MEUSEGREDO123

3. Inicie o servidor
npm start


Servidor rodará em:

http://localhost:3000

🗄 Configuração do Banco (PostgreSQL)

Exemplo de tabela:

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  client VARCHAR(100),
  total NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

✔ Status do Projeto

API totalmente funcional atendendo aos requisitos:

Criar pedido (obrigatório)

Buscar pedido por número (obrigatório)

Listar pedidos (opcional)

Atualizar pedido (opcional)

Deletar pedido (opcional)

JWT obrigatório para todas as rotas de pedidos