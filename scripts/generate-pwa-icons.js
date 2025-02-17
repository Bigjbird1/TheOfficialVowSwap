const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDirectory = path.join(process.cwd(), 'public', 'icons');

// Ensure the icons directory exists
if (!fs.existsSync(iconDirectory)) {
  fs.mkdirSync(iconDirectory, { recursive: true });
}

// Base icon path (you'll need to provide a high-resolution source icon)
const sourceIcon = path.join(process.cwd(), 'public', 'logo.png');

async function generateIcons() {
  try {
    // Check if source icon exists
    if (!fs.existsSync(sourceIcon)) {
      console.error('\x1b[31m%s\x1b[0m', 'Error: Source icon (logo.png) not found in public directory');
      console.error('Please add a high-resolution logo.png (at least 512x512) to the public directory');
      process.exit(1);
    }

    // Generate icons for each size
    for (const size of sizes) {
      await sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(iconDirectory, `icon-${size}x${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }

    // Generate favicon.ico
    await sharp(sourceIcon)
      .resize(32, 32)
      .toFile(path.join(process.cwd(), 'public', 'favicon.ico'));
    
    console.log('Generated favicon.ico');

    // Generate og-image.jpg and twitter-image.jpg
    await sharp(sourceIcon)
      .resize(1200, 630)
      .toFile(path.join(process.cwd(), 'public', 'og-image.jpg'));
    
    await sharp(sourceIcon)
      .resize(1200, 600)
      .toFile(path.join(process.cwd(), 'public', 'twitter-image.jpg'));
    
    console.log('Generated social media images');
    
    console.log('\x1b[32m%s\x1b[0m', '✓ All PWA and social media images generated successfully');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error generating images:');
    console.error(error);
    process.exit(1);
  }
}

generateIcons();
