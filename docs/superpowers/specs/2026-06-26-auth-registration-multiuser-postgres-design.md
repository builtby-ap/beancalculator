# Registration, Multi-User & PostgreSQL Migration — Design Spec

## Goal

Migrate the Myanmar bean trading calculator from JSON file storage to PostgreSQL, add user registration, and support multiple independent users — each owning their own invoices and transactions, while sharing bean type definitions.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data ownership | Mixed: beans shared, invoices/transactions per-user | Bean types are universal; each trader has their own sales |
| Roles | None — all users equal | Simplifies the system; no admin panel needed |
| Registration | Open — anyone can sign up | No approval workflow needed |
| Data migration | Migrate existing JSON data to PostgreSQL | Preserve the 38 beans, 5 invoices, 1 transaction, admin user |
| PostgreSQL client | Knex.js | Query builder + migration tooling, good fit for Express |

## Database Schema

### Table: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(30),
  business_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

- `username` is the login identifier, unique, case-sensitive
- `password_hash` is bcrypt-hashed (same as current)
- Existing admin user migrated with preserved password hash

### Table: `beans`

```sql
CREATE TABLE beans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  standard_weight NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- **No `user_id` column** — beans are shared globally
- All users can CRUD all beans (same as current behavior)
- Existing 38 beans migrated with their original IDs

### Table: `invoices`

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  farmer_name VARCHAR(100) NOT NULL,
  bean_rows JSONB NOT NULL,
  bean_name VARCHAR(200),
  weight JSONB NOT NULL,
  pricing JSONB NOT NULL,
  deductions JSONB NOT NULL,
  summary JSONB NOT NULL,
  paid_amount NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_date ON invoices(date);
```

- `user_id` FK to `users` — each invoice belongs to one user
- `bean_rows` stores the multi-bean array as JSONB (same structure as current)
- `weight`, `pricing`, `deductions`, `summary` store nested objects as JSONB
- `invoice_id` is the human-readable ID like `INV-1750845600-a3b2`
- Queries filter by `WHERE user_id = ?` from JWT

### Table: `transactions`

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_name VARCHAR(100) NOT NULL,
  bean_type_id VARCHAR(50) REFERENCES beans(id),
  bean_name VARCHAR(100),
  number_of_bags INTEGER NOT NULL,
  viss_per_bag NUMERIC(10,2) NOT NULL,
  extra_viss NUMERIC(10,2) DEFAULT 0,
  price NUMERIC(15,2) NOT NULL,
  weight JSONB NOT NULL,
  settlement JSONB NOT NULL,
  deductions JSONB,
  paid_amount NUMERIC(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'unpaid',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
```

- `user_id` FK to `users` — each transaction belongs to one user
- `bean_type_id` FK to `beans` (nullable — bean could be deleted)
- `weight` stores `{ totalViss, breakdown: { ... } }`
- `settlement` stores the full settlement calculation result
- Queries filter by `WHERE user_id = ?` from JWT

### Table: `system_settings`

```sql
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

- Single-row table (id always 1)
- `settings` stores the same JSON structure as current `system_settings.json`
- Shared across all users

## API Changes

### New: `POST /api/auth/register`

```
Request:  { username, password, name?, phone?, business_name? }
Response: { token, user: { id, username, name, phone, business_name } }
```

- Validates: username required (3-50 chars), password required (min 6 chars)
- Checks username uniqueness
- Hashes password with bcrypt
- Creates user row
- Returns JWT + user profile (same shape as login)

### Modified: All data routes

- `GET /api/beans` — unchanged (global)
- `POST/PUT/DELETE /api/beans/:id` — unchanged (global)
- `GET /api/invoice` — adds `WHERE user_id = ?`
- `POST /api/invoice` — sets `user_id` from JWT
- `GET /api/invoice/summary` — filters by `user_id`
- `PUT/DELETE /api/invoice/:id` — verifies `user_id` ownership
- `GET /api/transactions` — adds `WHERE user_id = ?`
- `POST /api/transactions` — sets `user_id` from JWT
- `PUT/DELETE /api/transactions/:id` — verifies `user_id` ownership
- `GET /api/transactions/summary` — filters by `user_id`
- `GET/PUT /api/auth/settings` — unchanged (global single row)

### Unchanged: Auth routes

- `POST /api/auth/login` — same behavior, reads from `users` table
- `GET /api/auth/me` — reads from `users` table by JWT id
- `PUT /api/auth/profile` — updates `users` row
- `PUT /api/auth/change-password` — updates `users` row

## Client Changes

### New: `RegisterForm.jsx`

- Fields: username, password, confirm password, name (optional), phone (optional), business_name (optional)
- Client-side validation: username 3-50 chars, password min 6 chars, passwords match
- Calls `POST /api/auth/register`
- On success: stores token + user (same as login), redirects to `/`
- Link from login page: "အကောင့်မရှိသေးဘူးလား? စာရင်းသွင်းရန်" (Don't have an account? Register)

### New: `api/client.js` functions

- `register(data)` — POST /auth/register

### Modified: `AuthContext.jsx`

- No structural changes needed — login/register both return `{ token, user }`

### Modified: `App.jsx`

- Add `/register` route (public, redirects to `/` if already logged in)

### Modified: `LoginForm.jsx`

- Add link to register page at the bottom

## Migration Strategy

### Knex Migrations

1. `001_create_users.js` — create users table
2. `002_create_beans.js` — create beans table
3. `003_create_invoices.js` — create invoices table + indexes
4. `004_create_transactions.js` — create transactions table + index
5. `005_create_system_settings.js` — create system_settings table

### Seed: `001_migrate_json_data.js`

Reads existing JSON files and inserts into PostgreSQL:

1. **Users**: inserts admin user from `admin_user.json` with preserved ID, password hash, and timestamps
2. **Beans**: inserts all 38 beans from `beans.json` with original IDs
3. **Invoices**: inserts all 5 invoices from `invoices.json`, assigns `user_id` to admin user
4. **Transactions**: inserts 1 transaction from `transactions.json`, assigns `user_id` to admin user
5. **System settings**: inserts settings from `system_settings.json`

### JSONB Structure Preservation

The seed preserves the exact same JSON structure for `bean_rows`, `weight`, `pricing`, `deductions`, `summary`, and `settlement` — no transformation needed. Knex inserts the objects directly as JSONB.

## File Structure

### Server files to create

```
server/
  knex.js                    (Knex config + connection)
  migrations/
    001_create_users.js
    002_create_beans.js
    003_create_invoices.js
    004_create_transactions.js
    005_create_system_settings.js
  seeds/
    001_migrate_json_data.js
```

### Server files to modify

```
server/package.json          (add knex, pg)
server/index.js              (init knex, pass to routes)
server/middleware/auth.js    (no changes — JWT logic stays)
server/routes/auth.js        (rewrite for knex + add register)
server/routes/beans.js       (rewrite for knex)
server/routes/invoice.js     (rewrite for knex + user_id filter)
server/routes/transactions.js (rewrite for knex + user_id filter)
```

### Client files to create

```
client/src/components/auth/RegisterForm.jsx
```

### Client files to modify

```
client/src/api/client.js         (add register function)
client/src/App.jsx               (add /register route)
client/src/components/auth/LoginForm.jsx (add register link)
```

## Environment

New env var: `DATABASE_URL` (e.g., `postgresql://user:pass@localhost:5432/bean_calculator`)

Fallback: `postgresql://localhost:5432/bean_calculator` for local dev.

## Error Handling

- Registration: duplicate username returns 409 with Burmese message
- Data routes: invalid user_id returns 403
- Knex connection errors: log and return 500
- All existing Burmese error messages preserved
