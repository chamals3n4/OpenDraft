## OpenDraft ✍️

**OpenDraft** is an open-source, lightweight blog writing platform designed for developers and content creators who want a simple yet powerful solution for managing their content.

You can try out a live demo of OpenDraft here: **<a href="http://opendraft-demo.vercel.app/" target="_blank">opendraft-demo.vercel.app</a>**

**Demo Credentials:**

- **Email**: `admin@opendraft.git`
- **Password**: `Hello25#`

![OpenDraft UI](./public/mockup.png)

- [Why OpenDraft?](#why-opendraft)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Access](#api-access)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Support](#support)

### Why OpenDraft?

When I was building [elephantjourney.info](https://elephantjourney.info) with my friend, we needed a blog writing platform for this. We wanted something simple, just for creating and managing content, so I decided to build a fully custom one. Later, I did the same thing for a few other projects as well. After that, I realized it would be better to make this open source, so anyone can easily set up their own content writing platform and access the content through a REST API for their public website.

**OpenDraft is NOT a fully-featured CMS** like PayloadCMS or Strapi. Instead, it's a focused blogging platform that lets you:

- Create and publish content with a beautiful editor
- Manage posts, pages, and documentation
- Organize content with categories and tags
- Handle media uploads
- Perform essential blog operations

If you need a lot of customization or complex content setup, a full CMS might be better for you. But if you just want a simple and lightweight blogging tool that works without hassle, OpenDraft is a good choice.

## Features

- **Rich Text Editor** - Powered by TipTap with extensive formatting options
- **Modern UI** - Built with Shadcn/ui and Base UI components
- **Authentication & Authorization** - Role-based access control (Admin, Editor, Contributor)
- **Content Management** - Support for posts, pages, documentation, and more
- **Categories & Tags** - Organize your content efficiently
- **Media Library** - Upload and manage images and files
- **SEO Optimization** - Meta tags, Open Graph, and structured data support

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Editor**: [TipTap](https://tiptap.dev/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/), [Base UI](https://base-ui.com/)
- **Styling**: Tailwind CSS + SCSS
- **Package Manager**: pnpm

### Future Compatibility

I'm planning to add support for:

- MongoDB
- Firebase

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm/yarn
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/chamals3n4/OpenDraft.git
cd opendraft
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Note: The service role key is needed for admin operations.

### 5. Set Up the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `utils/db/schema.sql`
4. Paste and execute it in the SQL Editor

This will create:

- User profiles with role-based permissions
- Content tables (posts, pages, documentation)
- Categories and tags
- Media library
- SEO metadata
- Comments system
- Row Level Security (RLS) policies

### 6. Create Your First Admin User

1. Go to Supabase Authentication section
2. Create a new user with email/password
3. Copy the user's UUID
4. Run this SQL in the SQL Editor:

```sql
INSERT INTO profiles (id, display_name, role, status)
VALUES ('your-user-uuid', 'Admin User', 'admin', 'active');
```

### 7. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Login

Navigate to [http://localhost:3000/login](http://localhost:3000/login) and sign in with your admin credentials.

## Database Schema

The database includes the following main tables:

- **profiles** - User information and roles
- **contents** - Blog posts, pages, and documentation
- **categories** - Content organization
- **tags** - Content tagging system
- **content_tags** - Many-to-many relationship
- **media** - File and image storage
- **seo_meta** - SEO and metadata
- **comments** - Comment system (optional)
- **settings** - Application settings

For the complete schema, see [utils/db/schema.sql](utils/db/schema.sql).

## API Access

You can access the content through REST API endpoints at `/api/v1/*`. This includes endpoints for:

- Content (posts, pages, documentation)
- Categories
- Tags
- Media
- User profiles

**TODO**: Create complete API documentation

## Deployment

OpenDraft can be deployed to any platform that supports Next.js applications:

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables
4. Deploy!

### Other Platforms

- **Netlify**: Supports Next.js with the [Netlify adapter](https://docs.netlify.com/frameworks/next-js/)
- **Railway**: Direct deployment with automatic builds
- **AWS Amplify**: Full Next.js support
- **DigitalOcean App Platform**: Node.js and Next.js compatible
- **Self-hosted**: Use `pnpm build` and `pnpm start`

Make sure to set your environment variables on your deployment platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/chamals3n4/OpenDraft/issues) page.

---

**Happy Writing!**
