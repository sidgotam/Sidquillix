## Nexify AI – Express Everything (Backend)

Production-ready Node.js + Express + MongoDB API for creating hybrid "Expressions" (text + images/videos), with JWT auth, likes, comments, filtering, pagination, and Cloudinary media uploads.

### Tech stack

- Node.js (ES Modules)
- Express.js
- MongoDB + Mongoose
- JWT auth
- bcrypt password hashing
- Cloudinary for media storage

### Folder structure

```
server/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
├── utils/
└── server.js
```

### Setup (local)

1) Install dependencies:

```bash
npm install
```

2) Create `.env`:

- Copy `.env.example` → `.env`
- Fill in MongoDB + Cloudinary + JWT settings

3) Start the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000` (default). Health check: `GET /health`.

### API overview

#### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

#### Expressions

- `POST /api/expressions` (protected, supports multipart upload field `media`)
- `GET /api/expressions` (filters + pagination)
- `GET /api/expressions/:id`
- `PUT /api/expressions/:id` (protected, owner only, supports multipart upload field `media`)
- `DELETE /api/expressions/:id` (protected, owner only)
- `PUT /api/expressions/:id/like` (protected, toggles like)

Filtering / pagination params for `GET /api/expressions`:

- `mood`: `motivated | thoughtful | emotional | casual | trending`
- `mediaType`: `text | image | video | hybrid`
- `page`: number (default 1)
- `limit`: 1-50 (default 10)

#### Comments

- `POST /api/comments` (protected)
- `GET /api/comments/:expressionId` (pagination)
- `DELETE /api/comments/:id` (protected; comment owner or expression owner)

### Uploading media (Cloudinary)

Use `multipart/form-data` for create/update expression:

- **field** `media`: multiple files (images/videos)
- **fields** `text` (optional), `mood` (required)

The API uploads each file to Cloudinary and stores `secure_url` in the `Expression.media[]`.

