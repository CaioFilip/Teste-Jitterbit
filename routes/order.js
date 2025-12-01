const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * POST /order
 */
router.post('/', async (req, res) => {
  const { orderId, value, creationDate, items } = req.body;

  if (!orderId || value === undefined) {
    return res.status(400).json({ error: "orderId e value são obrigatórios." });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Inserir order
    const insertOrderQuery = `
      INSERT INTO "Order"(orderId, value, creationDate)
      VALUES ($1, $2, COALESCE($3, now()))
      RETURNING orderId, value, creationDate
    `;
    const orderRes = await client.query(insertOrderQuery, [orderId, value, creationDate]);

    // Inserir items
    if (Array.isArray(items) && items.length > 0) {
      const insertItemText = `
        INSERT INTO "Items"(orderId, productId, quantity, price)
        VALUES ($1, $2, $3, $4)
      `;
      for (const it of items) {
        if (!it.productId || !it.quantity || it.price === undefined) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Cada item precisa de productId, quantity e price." });
        }
        await client.query(insertItemText, [orderId, it.productId, it.quantity, it.price]);
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Pedido criado com sucesso.',
      order: orderRes.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /order error:', err);
    if (err.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'orderId já existe.' });
    }
    return res.status(500).json({ error: 'Erro interno ao criar pedido.' });
  } finally {
    client.release();
  }
});

/*
 * GET /order/:orderId
 */
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const orderQ = `SELECT orderId, value, creationDate FROM "Order" WHERE orderId = $1`;
    const orderRes = await db.query(orderQ, [orderId]);
    if (orderRes.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    const itemsQ = `SELECT productId, quantity, price FROM "Items" WHERE orderId = $1`;
    const itemsRes = await db.query(itemsQ, [orderId]);

    const order = orderRes.rows[0];
    order.items = itemsRes.rows;
    return res.json(order);
  } catch (err) {
    console.error(`GET /order/${orderId} error:`, err);
    return res.status(500).json({ error: 'Erro interno ao buscar pedido.' });
  }
});

/*
 * GET /order/list
 * Lista os pedidos 
 */
router.get('/list', async (req, res) => {
  try {
    const q = `
      SELECT o.orderId, o.value, o.creationDate,
             COALESCE(json_agg(json_build_object('productId', i.productId, 'quantity', i.quantity, 'price', i.price))
             FILTER (WHERE i.productId IS NOT NULL), '[]') AS items
      FROM "Order" o
      LEFT JOIN "Items" i ON i.orderId = o.orderId
      GROUP BY o.orderId, o.value, o.creationDate
      ORDER BY o.creationDate DESC
    `;
    const result = await db.query(q);
    return res.json(result.rows);
  } catch (err) {
    console.error('GET /order/list error:', err);
    return res.status(500).json({ error: 'Erro interno ao listar pedidos.' });
  }
});

/**
 * PUT /order/:orderId
 * Atualiza o pedido (value e items). Se enviar items, substitui os itens antigos.
 */
router.put('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { value, items } = req.body;

  if (value === undefined && items === undefined) {
    return res.status(400).json({ error: 'Nada para atualizar. Envie value e/ou items.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Verifica existência
    const exists = await client.query(`SELECT orderId FROM "Order" WHERE orderId = $1 FOR UPDATE`, [orderId]);
    if (exists.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    if (value !== undefined) {
      await client.query(`UPDATE "Order" SET value = $1 WHERE orderId = $2`, [value, orderId]);
    }

    if (Array.isArray(items)) {
      // Simples: remover items antigos e inserir novos (poderia alterar incrementalmente)
      await client.query(`DELETE FROM "Items" WHERE orderId = $1`, [orderId]);
      const insertItemText = `INSERT INTO "Items"(orderId, productId, quantity, price) VALUES ($1, $2, $3, $4)`;
      for (const it of items) {
        if (!it.productId || !it.quantity || it.price === undefined) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Cada item precisa de productId, quantity e price." });
        }
        await client.query(insertItemText, [orderId, it.productId, it.quantity, it.price]);
      }
    }

    await client.query('COMMIT');
    return res.json({ message: 'Pedido atualizado com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`PUT /order/${orderId} error:`, err);
    return res.status(500).json({ error: 'Erro interno ao atualizar pedido.' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /order/:orderId
 * Deleta pedido e items (cascade por foreign key).
 */
router.delete('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const del = await db.query(`DELETE FROM "Order" WHERE orderId = $1 RETURNING orderId`, [orderId]);
    if (del.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }
    return res.json({ message: 'Pedido deletado com sucesso.' });
  } catch (err) {
    console.error(`DELETE /order/${orderId} error:`, err);
    return res.status(500).json({ error: 'Erro interno ao deletar pedido.' });
  }
});

module.exports = router;
