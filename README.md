# ResumeHub

A full-stack resume builder web app where candidates can create, edit, and export their resume as a PDF, and recruiters can browse and search candidate resumes.

## Live Demo

[ResumeHub](https://resume-builder-ibozsstn7-krishcshah09-1630s-projects.vercel.app/)

## Screenshots

### Login
<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/a14af8bb-7a7a-41d2-a53e-9a42ec7e3bcc" />

### Resume View
<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/7b275928-84e8-48f2-8571-d1e55e8bab62" />
<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/cc00383c-2a9d-4742-9d1a-7e70a6348657" />
<img width="473" height="666" alt="image" src="https://github.com/user-attachments/assets/92887597-faa1-4cf3-a083-f4d049b2ecd4" />

### Create Resume
<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/ac4e9b90-9549-4c69-ad02-6ca81bd5f710" />

### Recruiter Browse
<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/3ff637a0-5671-461c-bb80-4d11da78a851" />

### Profile
<img width="1470" height="801" alt="image" src="https://github.com/user-attachments/assets/67eeefba-6e14-4599-a704-90293eb4d152" />

## Features

**Candidates**
- Create, edit, and delete resume with sections for experience, education, projects, achievements, and skills
- Export resume as a professionally formatted PDF
- Upload and delete profile photo
- Toggle resume visibility (public/private)

**Recruiters**
- Browse all public candidate resumes with pagination
- Search by candidate name, resume title, or skill
- Sort by most skills or latest
- View individual candidate resumes
- Upload and delete profile photo

**Auth**
- JWT authentication via httpOnly cookies
- Role-based access control (candidate vs recruiter)
- Secure login, signup, and logout

## Tech Stack

**Frontend**
- React + TypeScript
- TanStack Query
- React Hook Form + Zod
- React Router
- Axios
- @react-pdf/renderer
- react-hot-toast

**Backend**
- Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT
- Bcrypt
- Multer + Cloudinary
- Zod

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL database (or [Neon](https://neon.tech))
- Cloudinary account

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL=<YOUR_DATABASE_URL>
JWT_SECRET=<YOUR_JWT_SECRET>
CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>
API_KEY=<YOUR_CLOUDINARY_API_KEY>
API_SECRET=<YOUR_CLOUDINARY_API_SECRET>
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run migrations and start the server:

```bash
npx prisma migrate deploy
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

## Deployment

- **Database:** [Neon](https://neon.tech)
- **Backend:** [Render](https://render.com)
- **Frontend:** [Vercel](https://vercel.com)

## License

MIT
