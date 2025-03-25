# Uhai Centre Church Website

A modern church website built with Next.js 15.2.3, TypeScript, and MongoDB for Uhai Centre Church in Kiambu, Kenya.

## Project Overview

This website serves as a digital platform for Uhai Centre Church with the following features:
- Sermon videos and live streaming integration via YouTube
- Event calendar and management
- Blog/announcements section
- Online donations via M-Pesa
- Prayer request submission
- Secure admin dashboard for content management

## Project Structure

A detailed file structure tree is available in [file-structure.md](file-structure.md).

The project follows a standard Next.js App Router structure with these main directories:
- `app/`: Pages and API routes
- `components/`: Reusable React components
- `lib/`: Utility functions and services
- `models/`: MongoDB schemas
- `public/`: Static assets
- `scripts/`: Utility scripts for setup and maintenance

## Technology Stack

- **Frontend**: Next.js 15.2.3, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (App Router)
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Media Storage**: Cloudinary
- **Payment Integration**: M-Pesa
- **Email Notifications**: Brevo API (SendGrid)
- **Deployment**: (pending) Domain: uhaicentre.church

## Project Structure

The project follows a standard Next.js App Router structure:

```
UHAI_CENTER/
├── app/                  # Pages and API routes
│   ├── about/            # About page
│   ├── admin/            # Admin dashboard pages  
│   ├── api/              # API endpoints
│   ├── auth/             # Authentication pages
│   ├── blog/             # Blog pages
│   ├── calendar/         # Events calendar
│   ├── contact/          # Contact page
│   ├── events/           # Events page
│   ├── give/             # Donations page
│   ├── prayer/           # Prayer request page
│   └── sermons/          # Sermons page
├── components/           # React components
│   ├── admin/            # Admin dashboard components
│   ├── analytics/        # Analytics components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   ├── sermons/          # Sermon components
│   ├── ui/               # UI components
│   └── youtube/          # YouTube integration components
├── lib/                  # Utility functions and services
│   ├── analytics/        # Analytics utilities
│   ├── api/              # API utilities
│   ├── cloudinary/       # Cloudinary integration
│   ├── db/               # Database connection
│   └── email/            # Email utilities
├── models/               # MongoDB models
├── public/               # Static assets
└── scripts/              # Setup and utility scripts
```

## Current Status

- Project foundation and structure set up
- Core website structure implemented
- YouTube integration for sermons
- Admin dashboard created
- Forms and functionality implemented
- M-Pesa integration for donations

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (copy from .env.example to .env.local)
4. Run the development server:
   ```
   npm run dev
   ```

## Environment Variables

This project requires the following environment variables:

```
MONGODB_URI=your_mongodb_connection_string
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxx
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_google_service_account_email
GOOGLE_PRIVATE_KEY=your_google_private_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
BREVO_API_KEY=your_brevo_api_key
ADMIN_EMAIL=admin@uhaicentre.church
PRAYER_TEAM_EMAIL=prayer@uhaicentre.church
FINANCE_TEAM_EMAIL=finance@uhaicentre.church
EVENTS_TEAM_EMAIL=events@uhaicentre.church
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Project Utilities

### File Structure Tracker

This project includes a utility to automatically generate a file structure document:

```
node scripts/file-structure-tracker.js
```

The output will be saved to `file-structure.md` in the project root.

### Error Tracker

For tracking build and compilation errors, use the error tracker script:

```
node scripts/error-tracker.js
```

This will generate an `error-report.md` file detailing any build issues, TypeScript errors, linting problems, and dependency concerns.

## Current Challenges

1. Client component directive issues - need to add 'use client' for components using React hooks
2. Module resolution problems for models
3. Conflicts between client components and metadata exports
4. Missing dependencies (chart.js, react-chartjs-2)

## Next Steps

1. Fix build errors to get a successful production build
2. Implement Brevo API for email notifications 
3. Add direct image upload capability using Cloudinary
4. Complete SEO optimization
5. Implement social media sharing
6. Complete analytics dashboard
7. Deploy to domain http://uhaicentre.church

## License

This project is private and proprietary to Uhai Centre Church and David Waweru Ngari.# ucc

## Admin Setup

The project includes a utility script for setting up admin users:

```bash
# Basic setup with default options
npm run setup-admin

# Reset password for existing admin user
npm run setup-admin -- --reset-password

# Use API method (requires server running)
npm run setup-admin -- --api

# Customize admin user details
npm run setup-admin -- --email admin@example.com --password mypassword --name "Custom Admin"

# For help and all available options
npm run setup-admin -- --help

## Environment Setup

The project includes a utility script for managing environment variables:

```bash
# Interactive setup (recommended for new developers)
npm run env:setup

# Check if all required environment variables are set
npm run env:check

# Update .env file with any missing variables
npm run env:update

# List all environment variables
npm run env:list

# Set specific environment variables
node scripts/env-manager.js --set "NEXTAUTH_URL=http://localhost:3000" "NEXTAUTH_SECRET=my-secret"