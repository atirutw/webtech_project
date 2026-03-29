# Project Requirements

## General Project Rules
- Group project: 3-4 students per group
- Presentation time: 30 minutes
- On presentation day, print a summary document explaining:
  - What the project can do
  - How it works
  - Similar to a user manual
- **Cover page** must include: Group members' names + Student IDs

---

## Online API Document
Create an **online API documentation** that explains how to use the API.  
For **every endpoint**, include:

- What the endpoint does
- Available parameters
- What it returns
- Example of how to call it
- Example of the result/response

---

## Web Application

### Frontend
(Technology: Any frontend framework/library is allowed, but must communicate with Backend via **REST API**)

#### Products (สินค้า)
- View all products **[Member + Admin]**
- View product details **[Member + Admin]**
- Add / Edit products **[Admin only]**

#### Members (สมาชิก)
- Register (สมัครสมาชิก) **[Member + Admin]**
- Login (Authentication) **[Member + Admin]**
- Edit member information **[Member]**
- Change member status **[Admin]**

#### Transactions (การซื้อขาย)
- Purchase products (ซื้อสินค้า) **[Member]**
- View purchase details (for each transaction) **[Member + Admin]**
- View all purchase history (per customer) **[Member + Admin]**

---

### Backend
- Provide services to handle all requests from the Frontend
- Database: **PostgreSQL**
- Technology: **Node.js + Express.js**
- Must create **API Documentation** (as specified above)

---

## Additional Required Features

### Admin Features
1. Add new products / Edit product information
2. Add or change product images
3. List all Members
4. Add new Admin / Change member status (e.g., promote to Admin)
5. View each Member’s purchase history (similar to Member view)

### Member Features
1. Can confirm / place an order (ยืนยันสั่งสินค้า)
2. While order is **not yet confirmed**:
   - Remove individual items from cart
   - Clear entire cart
   - Once confirmed, these actions are **no longer allowed**
3. Cannot edit product information
4. Can edit personal information

---

**Note**: The project must implement proper role-based access control (Member vs Admin) for all listed features.
