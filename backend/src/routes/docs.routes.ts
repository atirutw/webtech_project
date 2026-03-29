import { Router } from 'express'

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Music Store API Docs</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f6f8fb; color: #111827; }
    main { max-width: 1080px; margin: 0 auto; padding: 24px; }
    h1, h2 { margin: 0 0 12px; }
    .card { background: #fff; border: 1px solid #dde3ec; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
    .method { display: inline-block; min-width: 60px; font-weight: 700; color: #7c2d12; }
    code, pre { background: #f3f4f6; border-radius: 8px; }
    code { padding: 2px 6px; }
    pre { padding: 10px; overflow-x: auto; }
  </style>
</head>
<body>
  <main>
    <h1>Music Store API Documentation</h1>
    <p>Base URL: <code>http://localhost:4000</code></p>

    <h2>Authentication</h2>
    <div class="card">
      <p><span class="method">POST</span> <code>/auth/register</code></p>
      <p>Register new user (or admin when <code>adminKey</code> is correct).</p>
      <p>Parameters: <code>name</code>, <code>email</code>, <code>password</code>, optional <code>adminKey</code></p>
      <p>Returns: <code>{ token, user }</code></p>
      <pre>{ "name": "User", "email": "u@example.com", "password": "password123" }</pre>
    </div>

    <div class="card">
      <p><span class="method">POST</span> <code>/auth/login</code></p>
      <p>Login and receive access token.</p>
      <p>Parameters: <code>email</code>, <code>password</code></p>
      <p>Returns: <code>{ token, user }</code></p>
      <pre>{ "email": "u@example.com", "password": "password123" }</pre>
    </div>

    <div class="card">
      <p><span class="method">GET</span> <code>/auth/me</code></p>
      <p>Get current profile by Bearer token.</p>
      <p>Parameters: Header <code>Authorization: Bearer &lt;token&gt;</code></p>
      <p>Returns: <code>{ user }</code></p>
    </div>

    <div class="card">
      <p><span class="method">PATCH</span> <code>/auth/me</code></p>
      <p>Update current user profile and optional password.</p>
      <p>Parameters: any of <code>name</code>, <code>email</code>, <code>currentPassword</code>, <code>newPassword</code></p>
      <p>Returns: <code>{ user }</code></p>
      <pre>{ "name": "New Name", "newPassword": "newpassword1", "currentPassword": "oldpassword" }</pre>
    </div>

    <div class="card">
      <p><span class="method">POST</span> <code>/auth/logout</code></p>
      <p>Invalidate current token.</p>
      <p>Parameters: Header <code>Authorization: Bearer &lt;token&gt;</code></p>
      <p>Returns: <code>204 No Content</code></p>
    </div>

    <h2>Products</h2>
    <div class="card">
      <p><span class="method">GET</span> <code>/products</code></p>
      <p>List products with paging/filter/sort.</p>
      <p>Parameters: <code>page</code>, <code>limit</code>, <code>category</code>, <code>type</code>, <code>search</code>, <code>brand</code>, <code>sort</code></p>
      <p>Returns: <code>{ items, total, page, limit, totalPages }</code></p>
    </div>

    <div class="card">
      <p><span class="method">GET</span> <code>/products/categories</code></p>
      <p>Get category counts used by frontend filters.</p>
      <p>Parameters: optional <code>type</code></p>
      <p>Returns: <code>{ categories }</code></p>
    </div>

    <div class="card">
      <p><span class="method">GET</span> <code>/products/:id</code></p>
      <p>Get product detail by id.</p>
      <p>Parameters: path <code>id</code></p>
      <p>Returns: <code>{ item }</code></p>
    </div>

    <div class="card">
      <p><span class="method">POST</span> <code>/products</code> (Admin)</p>
      <p>Create product.</p>
      <p>Parameters: <code>name</code>, <code>brand</code>, <code>category</code>, <code>type</code>, <code>price</code>, <code>image</code>, <code>stock</code></p>
      <p>Returns: <code>{ item }</code></p>
    </div>

    <div class="card">
      <p><span class="method">PATCH</span> <code>/products/:id</code> (Admin)</p>
      <p>Update product fields.</p>
      <p>Parameters: path <code>id</code>, body any editable product field</p>
      <p>Returns: <code>{ item }</code></p>
    </div>

    <div class="card">
      <p><span class="method">DELETE</span> <code>/products/:id</code> (Admin)</p>
      <p>Delete product.</p>
      <p>Parameters: path <code>id</code></p>
      <p>Returns: <code>204 No Content</code></p>
    </div>

    <h2>Cart & Checkout</h2>
    <div class="card">
      <p><span class="method">GET</span> <code>/cart</code></p>
      <p>Get authenticated user cart.</p>
      <p>Returns: <code>{ items, total }</code></p>
    </div>

    <div class="card">
      <p><span class="method">POST</span> <code>/cart/items</code></p>
      <p>Add item to cart.</p>
      <p>Parameters: <code>productId</code>, <code>quantity</code></p>
      <p>Returns: <code>{ items, total }</code></p>
    </div>

    <div class="card">
      <p><span class="method">PATCH</span> <code>/cart/items/:cartItemId</code></p>
      <p>Update cart item quantity.</p>
      <p>Parameters: path <code>cartItemId</code>, body <code>quantity</code></p>
      <p>Returns: <code>{ items, total }</code></p>
    </div>

    <div class="card">
      <p><span class="method">DELETE</span> <code>/cart/items/:cartItemId</code></p>
      <p>Remove one cart item.</p>
      <p>Returns: <code>{ items, total }</code></p>
    </div>

    <div class="card">
      <p><span class="method">DELETE</span> <code>/cart</code></p>
      <p>Clear all cart items.</p>
      <p>Returns: <code>{ items, total }</code></p>
    </div>

    <div class="card">
      <p><span class="method">POST</span> <code>/cart/checkout</code> (Member only)</p>
      <p>Confirm purchase and create order.</p>
      <p>Returns: <code>{ order }</code></p>
      <pre>{ "order": { "id": 12, "status": "confirmed", "totalAmount": 12900 } }</pre>
    </div>

    <h2>Orders / Transactions</h2>
    <div class="card">
      <p><span class="method">GET</span> <code>/orders</code></p>
      <p>Get current member purchase history.</p>
      <p>Returns: <code>{ orders }</code></p>
    </div>

    <div class="card">
      <p><span class="method">GET</span> <code>/orders/:orderId</code></p>
      <p>Get transaction detail for the current member.</p>
      <p>Returns: <code>{ order }</code></p>
    </div>

    <h2>Admin</h2>
    <div class="card">
      <p><span class="method">GET</span> <code>/admin/users</code></p>
      <p>List all users.</p>
      <p>Returns: <code>{ users }</code></p>
    </div>

    <div class="card">
      <p><span class="method">PATCH</span> <code>/admin/users/:id</code></p>
      <p>Edit user name/email/role.</p>
      <p>Returns: <code>{ user }</code></p>
    </div>

    <div class="card">
      <p><span class="method">DELETE</span> <code>/admin/users/:id</code></p>
      <p>Delete user (cannot delete self/last admin).</p>
      <p>Returns: <code>204 No Content</code></p>
    </div>

    <div class="card">
      <p><span class="method">GET</span> <code>/admin/users/:id/orders</code></p>
      <p>Get purchase history of a specific member.</p>
      <p>Returns: <code>{ orders }</code></p>
    </div>

    <div class="card">
      <p><span class="method">GET</span> <code>/admin/orders/:orderId</code></p>
      <p>Get transaction detail for any order as admin.</p>
      <p>Returns: <code>{ order }</code></p>
    </div>

    <h2>Health</h2>
    <div class="card">
      <p><span class="method">GET</span> <code>/health</code></p>
      <p>Service health check.</p>
      <p>Returns: <code>{ status: "ok" }</code></p>
    </div>
  </main>
</body>
</html>`

export const docsRouter = Router()

docsRouter.get('/', (_req, res) => {
    res.type('html').send(html)
})
