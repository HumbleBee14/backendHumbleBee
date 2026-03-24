# Multi-User Blogging Platform - Backend

REST API backend for a multi-user blogging platform with role-based access control, SEO optimization, and Google OAuth integration.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + Google OAuth
- **Email:** Nodemailer (SMTP)
- **Image Processing:** Sharp
- **Validation:** express-validator

## Features

- User registration with email verification (account activation flow)
- JWT-based authentication with role-based access (admin/user)
- Google OAuth login
- Password reset via email
- Blog CRUD with rich text, categories, tags, and featured images
- SEO support (slugs, meta titles, meta descriptions)
- Blog search and related posts
- User profiles (public and private)
- Contact form and author messaging
- Image compression and optimization

## Project Structure

```
controllers/     # Route handlers and business logic
routes/          # API route definitions
models/          # Mongoose schemas (User, Blog, Category, Tag)
validators/      # Input validation middleware
helpers/         # Utility functions (email, error handling)
server.js        # Express app entry point
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/preSignup` | Pre-signup with email verification |
| POST | `/api/signup` | Complete registration |
| POST | `/api/signin` | Login |
| GET | `/api/signout` | Logout |
| PUT | `/api/forgot-password` | Request password reset |
| PUT | `/api/reset-password` | Reset password with token |
| POST | `/api/google-login` | Google OAuth login |

### Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/blog` | Admin | Create blog |
| GET | `/api/blogs` | - | List all blogs |
| POST | `/api/blogs-categories-tags` | - | List with filters/pagination |
| GET | `/api/blog/:slug` | - | Get blog by slug |
| PUT | `/api/blog/:slug` | Admin | Update blog |
| DELETE | `/api/blog/:slug` | Admin | Delete blog |
| GET | `/api/blogs/search` | - | Search blogs |
| POST | `/api/blogs/related` | - | Related blogs |
| POST | `/api/user/blog` | User | Create blog (auth user) |
| GET | `/api/:username/blogs` | - | Blogs by user |
| PUT | `/api/user/blog/:slug` | User | Update own blog |
| DELETE | `/api/user/blog/:slug` | User | Delete own blog |

### Categories & Tags
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/category` | Admin | Create category |
| GET | `/api/categories` | - | List categories |
| GET | `/api/category/:slug` | - | Category with blogs |
| DELETE | `/api/category/:slug` | Admin | Delete category |
| POST | `/api/tag` | Admin | Create tag |
| GET | `/api/tags` | - | List tags |
| GET | `/api/tag/:slug` | - | Get tag |
| DELETE | `/api/tag/:slug` | Admin | Delete tag |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | User | Private profile |
| GET | `/api/user/:username` | - | Public profile |
| PUT | `/api/user/update` | User | Update profile |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Contact form |
| POST | `/api/contact-blog-author` | Message author |

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd backendHumbleBee
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_LOCAL=mongodb://localhost:27017/your-db
# DATABASE_CLOUD=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>

# JWT
JWT_SECRET=your-jwt-secret
JWT_ACCOUNT_ACTIVATION_SECRET=your-activation-secret
JWT_RESET_PASSWORD=your-reset-secret

# Email (SMTP)
EMAIL_TO=your-email@example.com
EMAIL_FROM=noreply@yourdomain.com
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
```

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server runs on `http://localhost:8000` by default.

## License

ISC
