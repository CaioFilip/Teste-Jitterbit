# Order API (Node.js + Express + PostgreSQL)

API simples para gerenciar pedidos (CRUD) com armazenamento em PostgreSQL.

## Endpoints principais

- POST `/order` - Criar novo pedido (obrigatório).
- GET `/order/:orderId` - Obter pedido por ID (obrigatório).
- GET `/order/list` - Listar todos os pedidos (opcional).
- PUT `/order/:orderId` - Atualizar pedido (opcional).
- DELETE `/order/:orderId` - Deletar pedido (opcional).

## Rodando localmente

1. Instalar dependências:
   ```bash
   npm install
