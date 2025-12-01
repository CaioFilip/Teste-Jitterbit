CREATE TABLE IF NOT EXISTS "Order" (
  orderId TEXT PRIMARY KEY,
  value NUMERIC(12,2) NOT NULL,
  creationDate TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Items" (
  id SERIAL PRIMARY KEY,
  orderId TEXT NOT NULL REFERENCES "Order"(orderId) ON DELETE CASCADE,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0)
);

-- índices (opcionais)
CREATE INDEX IF NOT EXISTS idx_items_orderid ON "Items"(orderId);
