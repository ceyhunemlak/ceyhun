// This file helps set up environment variables for the project
const fs = require('fs');
const path = require('path');

// Check if .env.local exists, if not create it
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...');
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Authentication
ADMIN_PASSWORD=your_admin_password
`;

  fs.writeFileSync(envPath, envContent);
  console.log('.env.local file created successfully. Please update it with your actual values.');
} else {
  console.log('.env.local file already exists.');
}

console.log('Environment setup complete!'); 