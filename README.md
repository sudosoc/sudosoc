# SudoSoc - Cybersecurity Platform

A comprehensive full-stack cybersecurity platform built with Next.js, featuring tools, scripts, e-books, and security research content.

## 🚀 Features

### Core Features
- **Security Tools Directory** - Discover and rate cybersecurity tools
- **Scripts Library** - Access and contribute security scripts
- **E-Books Section** - Download free cybersecurity e-books
- **Security Journal** - Curated CVE reports and security articles
- **User Authentication** - Secure login/register system
- **Admin Dashboard** - Complete content management system
- **Rating System** - Rate tools, scripts, and e-books
- **Reporting System** - Report issues with content
- **Sharing** - Native Web Share API integration

### Design & UX
- **Dark Theme** - Professional dark mode interface
- **Neon Red Accent** - Cybersecurity aesthetic with red glow effects
- **Responsive Design** - Mobile-first, optimized for all devices
- **Modern UI** - Clean, professional interface with smooth animations

### Security Features
- **Input Validation** - Comprehensive form validation and sanitization
- **XSS Protection** - Built-in security measures
- **SQL Injection Prevention** - Prisma ORM with parameterized queries
- **JWT Authentication** - Secure token-based authentication
- **Admin Controls** - Role-based access control

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime environment
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT handling

### Deployment
- **Vercel** - Frontend hosting
- **Cloudflare Pages** - Alternative hosting
- **PostgreSQL** - Database hosting (Supabase/Railway)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sudosoc.git
   cd sudosoc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/sudosoc"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # JWT
   JWT_SECRET="your-jwt-secret-here"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

The application uses Prisma with the following main models:

- **User** - User accounts and profiles
- **Tool** - Security tools with ratings
- **Script** - Security scripts with approval system
- **EBook** - Downloadable e-books
- **Journal** - Security articles and CVE reports
- **Rating** - User ratings for content
- **Report** - Issue reports for content
- **BookSuggestion** - User-submitted book suggestions

## 📁 Project Structure

```
sudosoc/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── tools/             # Tools page
│   ├── scripts/           # Scripts page
│   ├── ebooks/            # E-books page
│   ├── journal/           # Journal page
│   ├── login/             # Authentication pages
│   └── register/          # Registration page
├── components/            # Reusable components
│   ├── providers/         # Context providers
│   └── ui/               # UI components
├── prisma/               # Database schema
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔧 Configuration

### Database Configuration
The application uses PostgreSQL with Prisma ORM. Update the `DATABASE_URL` in your environment variables to point to your database.

### Authentication
NextAuth.js handles authentication with JWT tokens. Configure the secrets in your environment variables.

### Admin Access
To create an admin user, manually update the database:
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@example.com';
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
JWT_SECRET="your-production-jwt-secret"
```

## 📊 Features Overview

### User Features
- **Registration/Login** - Email-based authentication
- **Profile Management** - Update username, bio, avatar
- **Content Rating** - Rate tools, scripts, e-books
- **Content Sharing** - Share via Web Share API
- **Issue Reporting** - Report problems with content
- **Script Submission** - Submit scripts for review
- **Book Suggestions** - Suggest new e-books

### Admin Features
- **Dashboard Overview** - Statistics and pending items
- **Content Management** - Add/edit/delete tools, scripts, e-books
- **Approval System** - Review and approve user submissions
- **Report Handling** - Manage user reports
- **User Management** - View and manage users
- **Maintenance Mode** - Toggle maintenance mode

### Content Types
- **Tools** - Security tools with categories and ratings
- **Scripts** - Code scripts with language and type classification
- **E-Books** - PDF books with cover images and metadata
- **Journal** - Curated security articles and CVE reports

## 🔒 Security Considerations

- Input validation and sanitization
- SQL injection prevention via Prisma
- XSS protection
- CSRF protection
- Secure password hashing
- JWT token security
- Rate limiting (to be implemented)
- Content moderation system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@sudosoc.com

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] API documentation
- [ ] Advanced search filters
- [ ] User notifications
- [ ] Content versioning
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

**SudoSoc** - Empowering the cybersecurity community with tools, knowledge, and collaboration. 