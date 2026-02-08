CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  current_price NUMERIC(10,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE watches (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  target_price NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_product UNIQUE (user_id, product_id),

  CONSTRAINT watches_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT watches_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE TABLE product_images (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,

  CONSTRAINT product_images_image_unique
    UNIQUE (product_id, image_url),

  CONSTRAINT product_images_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE TABLE price_history (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT price_history_product_id_fkey
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE TABLE alert_watches (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  watch_id INTEGER NOT NULL,
  triggered_price NUMERIC(10,2) NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT alert_watches_watch_id_triggered_price_key
    UNIQUE (watch_id, triggered_price),

  CONSTRAINT alert_watches_watch_id_fkey
    FOREIGN KEY (watch_id)
    REFERENCES watches(id)
    ON DELETE CASCADE
);