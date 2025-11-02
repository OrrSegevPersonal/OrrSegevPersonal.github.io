# PWA Icons

This directory contains the icons for the Progressive Web App.

## Required Icon Sizes

The following icon sizes are needed for full PWA support:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

## Generating Icons

You can use the provided `icon-template.svg` file to generate all required sizes.

### Option 1: Using Online Tools
1. Visit [favicon.io](https://favicon.io/favicon-converter/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload the SVG or create a custom icon with Maccabi colors (#0047BA blue, #FFD700 yellow)
3. Download all generated sizes

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if not already installed
# Ubuntu/Debian: sudo apt-get install imagemagick
# macOS: brew install imagemagick

# Convert SVG to all required sizes
for size in 72 96 128 144 152 192 384 512; do
  convert icon-template.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

### Option 3: Using Node.js
```bash
npm install -g pwa-asset-generator
pwa-asset-generator icon-template.svg ./icons
```

## Design Guidelines

The icon should:
- Feature the basketball emoji or a simple basketball graphic
- Use Maccabi Tel Aviv brand colors:
  - Primary: #0047BA (Maccabi Blue)
  - Accent: #FFD700 (Yellow/Gold)
- Be simple and recognizable at small sizes
- Work well on both light and dark backgrounds
