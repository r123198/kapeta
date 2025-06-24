# kapeta! - Coffee Shop Directory Landing Page

"Let's get coffee!" - A modern, conversion-focused landing page for Iligan City's coffee shop directory platform.

## 🚀 Features

- **Modern Design**: Clean, coffee-themed aesthetic with responsive design
- **Email Collection**: Supabase integration for early access signups
- **Conversion Optimized**: Single primary action with clear value proposition
- **SEO Ready**: Proper meta tags and OpenGraph support
- **Mobile First**: Fully responsive design for all devices
- **Performance**: Fast loading with Next.js 15+ and optimized assets

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd kapeta
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Create the `early_users` table:

```sql
CREATE TABLE early_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE early_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow public inserts" ON early_users
  FOR INSERT WITH CHECK (true);
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── subscribe/
│   │       └── route.ts          # Email subscription API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main landing page
├── components/
│   ├── EmailForm.tsx             # Reusable email form
│   ├── Features.tsx              # Value proposition section
│   ├── Footer.tsx                # Footer component
│   ├── Hero.tsx                  # Hero section
│   ├── Pricing.tsx               # Pricing section
│   └── ProblemSolution.tsx       # Problem/solution section
└── lib/
    └── supabase.ts               # Supabase client
```

## 🎨 Customization

### Colors

The color palette is defined in `src/app/globals.css`:

- **Primary**: Coffee Brown (#8B4513)
- **Secondary**: Warm Cream (#F5F5DC)
- **Accent**: Forest Green (#228B22)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)

### Content

Update the content in each component file:
- `Hero.tsx`: Main headline and subheadline
- `Features.tsx`: Value proposition features
- `Pricing.tsx`: Pricing plans and features
- `Footer.tsx`: Contact information and links

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Analytics & Tracking

Consider adding analytics to track conversions:

- **Google Analytics**: For general traffic
- **Supabase Analytics**: For email signup tracking
- **Hotjar**: For user behavior insights

## 🔧 API Endpoints

### POST /api/subscribe

Handles email subscriptions:

**Request Body:**
```json
{
  "email": "user@example.com",
  "source": "hero_section"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome to kapeta! We'll notify you when we launch.",
  "data": { ... }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email hello@kapeta.ph or create an issue in this repository.

---

**kapeta!** - Let's get coffee! ☕
