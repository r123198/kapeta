# 🚀 kapeta! Deployment Guide

## Quick Setup Checklist

### 1. Supabase Setup (Required)
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Create `early_users` table (see SQL below)
- [ ] Copy project URL and anon key
- [ ] Add to environment variables

### 2. Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup
Run this SQL in your Supabase SQL editor:
```sql
CREATE TABLE early_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT
);

-- Enable Row Level Security
ALTER TABLE early_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow public inserts" ON early_users
  FOR INSERT WITH CHECK (true);
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial kapeta! landing page"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

### Option 2: Netlify

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `.next` folder to Netlify
   - Or connect your GitHub repository
   - Add environment variables in Netlify dashboard

### Option 3: Railway

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Add environment variables
   - Deploy automatically

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Post-Deployment Checklist

- [ ] Test email signup form
- [ ] Verify Supabase connection
- [ ] Check mobile responsiveness
- [ ] Test all links and buttons
- [ ] Verify SEO meta tags
- [ ] Set up analytics (optional)
- [ ] Configure custom domain (optional)

## 🎨 Customization

### Colors
Update colors in `src/app/globals.css`:
```css
:root {
  --primary: #8B4513;      /* Coffee Brown */
  --secondary: #F5F5DC;    /* Warm Cream */
  --accent: #228B22;       /* Forest Green */
  /* ... */
}
```

### Content
- **Hero**: `src/components/Hero.tsx`
- **Features**: `src/components/Features.tsx`
- **Pricing**: `src/components/Pricing.tsx`
- **Footer**: `src/components/Footer.tsx`

### Branding
- Update logo/brand name in components
- Replace placeholder contact information
- Update social media links

## 🔍 Troubleshooting

### Common Issues

1. **Email form not working**
   - Check Supabase credentials
   - Verify database table exists
   - Check browser console for errors

2. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check if PostCSS is working
   - Verify color variables are defined

3. **Build errors**
   - Check TypeScript configuration
   - Verify all dependencies are installed
   - Check for missing imports

### Support
- Check the [README.md](./README.md) for detailed setup instructions
- Review Supabase documentation for database issues
- Check Next.js documentation for framework issues

---

**kapeta!** - Let's get coffee! ☕ 