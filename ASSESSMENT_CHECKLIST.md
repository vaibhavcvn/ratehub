# TrustMark Assessment Checklist

| Requirement | Implemented | Location |
| --- | --- | --- |
| Three roles: ADMIN, USER, OWNER | Yes | `backend/prisma/schema.prisma`, `backend/src/middleware/auth.js` |
| PostgreSQL and Prisma schema | Yes | `backend/prisma/schema.prisma` |
| Seed data with bcrypt hashes | Yes | `backend/prisma/seed.js` |
| Registration and single login | Yes | `backend/src/routes/auth.js`, `frontend/src/pages/Auth.jsx` |
| JWT authentication | Yes | `backend/src/routes/auth.js`, `backend/src/middleware/auth.js` |
| Password update | Yes | `backend/src/routes/auth.js`, `frontend/src/pages/Profile.jsx` |
| Logout | Yes | `frontend/src/components/Layout.jsx` |
| Role-based backend authorization | Yes | `backend/src/routes/*.js` |
| Admin dashboard statistics | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/Dashboard.jsx` |
| Admin user management | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/Admin.jsx` |
| Admin store management | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/Admin.jsx` |
| User store search, sorting, and pagination | Yes | `backend/src/routes/user.js`, `frontend/src/pages/Stores.jsx`, `frontend/src/components/Pagination.jsx` |
| Admin search, sorting, and pagination UI | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/Admin.jsx`, `frontend/src/components/Pagination.jsx` |
| User store discovery UI | Yes | `frontend/src/pages/Stores.jsx` |
| Rating submission and modification | Yes | `backend/src/routes/user.js`, `frontend/src/pages/Stores.jsx` |
| One rating per user/store | Yes | `backend/prisma/schema.prisma` |
| Store categories and descriptions | Yes | `backend/prisma/schema.prisma`, `backend/prisma/seed.js` |
| Rating comments up to 500 characters | Yes | `backend/prisma/schema.prisma`, `backend/src/validators/schemas.js` |
| Store detail page and rating distribution | Yes | `backend/src/routes/user.js`, `frontend/src/pages/StoreDetail.jsx` |
| Persisted favorites | Yes | `backend/prisma/schema.prisma`, `backend/src/routes/user.js`, `frontend/src/pages/Favorites.jsx` |
| 30+ realistic stores and 100+ ratings | Yes | `backend/prisma/seed.js` |
| Rating deletion with ownership check | Yes | `backend/src/routes/user.js`, `frontend/src/pages/Ratings.jsx` |
| Owner-only store analytics | Yes | `backend/src/routes/owner.js`, `frontend/src/pages/Owner.jsx` |
| Server-side validation | Yes | `backend/src/validators/schemas.js` |
| Frontend and backend validation and error states | Yes | `backend/src/validators/schemas.js`, `frontend/src/pages/Auth.jsx`, forms and API messages |
| Centralized error handling | Yes | `backend/src/middleware/error.js` |
| Responsive navigation and tables | Yes | `frontend/src/components/Layout.jsx`, `frontend/src/index.css` |
| Loading and empty states | Yes | `frontend/src/pages/Dashboard.jsx`, `Stores.jsx`, `Ratings.jsx` |
| Environment variables and secret exclusion | Yes | `.env.example` files, `.gitignore` |
| Frontend build | Yes | `npm run build` verified |
| Backend startup | Yes | `npm run dev` verified |
| Prisma migration and seed execution | Yes | `prisma migrate dev`, `prisma db seed` verified |
| Browser/mobile visual verification | Pending local runtime | Requires dependencies and dev server |

## Runtime verification commands

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

In another terminal:

```powershell
cd frontend
npm install
npm run build
npm run dev
```

Verify `http://localhost:5000/api/health` and `http://localhost:5173`, then test the seeded credentials in `README.md` across all three roles.
