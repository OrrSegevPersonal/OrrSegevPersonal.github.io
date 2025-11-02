# 💧 Water Intake Tracker

A Progressive Web App (PWA) for tracking daily water intake, optimized for iOS and can be used without installation.

## Features

- 🎯 Set custom daily water intake goals
- 💧 Quick add buttons for common amounts (100ml, 250ml, 500ml, 750ml)
- ✏️ Custom amount input
- 📊 Visual progress tracking with circular progress indicator
- 📝 History of all water intake entries for the day
- 💾 Automatic data persistence using Local Storage
- 📱 iOS-ready with home screen installation support
- 🔄 Works offline with Service Worker
- 🎨 Beautiful, responsive design with gradient themes
- ⚡ Motivational tips to stay hydrated

## Installation

### On iOS (iPhone/iPad)

1. Open Safari and navigate to your app URL (e.g., `https://yourusername.github.io`)
2. Tap the **Share** button (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right corner
5. The app will appear on your home screen like a native app

### On Android

1. Open Chrome and navigate to your app URL
2. Tap the menu (three dots) in the top right
3. Tap **"Add to Home Screen"** or **"Install App"**
4. Tap **"Add"** to confirm
5. The app will be installed on your device

### Desktop (Chrome/Edge)

1. Navigate to your app URL
2. Look for the install icon in the address bar (➕ or ⬇️)
3. Click **"Install"** when prompted
4. The app will open in its own window

## Setup Icons

The app requires icons for proper PWA functionality. You have two options:

### Option 1: Generate Icons Automatically

1. Open `icons/generate-icons.html` in your browser
2. Click the "Download" button under each icon size
3. Save each file with its corresponding name (icon-72.png, icon-96.png, etc.)
4. Place all icons in the `/icons/` directory

### Option 2: Use Custom Icons

Create or use your own PNG icons in the following sizes:
- 72x72px → `icons/icon-72.png`
- 96x96px → `icons/icon-96.png`
- 128x128px → `icons/icon-128.png`
- 144x144px → `icons/icon-144.png`
- 152x152px → `icons/icon-152.png`
- 192x192px → `icons/icon-192.png`
- 384x384px → `icons/icon-384.png`
- 512x512px → `icons/icon-512.png`

## Deployment

### GitHub Pages

1. Push all files to your GitHub repository
2. Go to repository Settings → Pages
3. Select branch (e.g., `main` or `master`)
4. Select root (`/`) as the folder
5. Click Save
6. Your app will be available at `https://yourusername.github.io`

### Other Hosting

Simply upload all files to any web hosting service that supports HTTPS (required for PWA features).

## File Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js              # App functionality
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline support
├── icons/              # App icons directory
│   ├── generate-icons.html
│   └── icon-*.png      # Various icon sizes
└── README.md           # This file
```

## Usage

1. **Set Your Goal**: Edit the daily goal (default: 2000ml)
2. **Add Water**: Click quick-add buttons or enter a custom amount
3. **Track Progress**: Watch the circular progress indicator fill up
4. **View History**: See all entries with timestamps
5. **Remove Entries**: Click "Remove" on any entry to delete it
6. **Clear All**: Use "Clear All" to reset the day's intake

## Features in Detail

### Data Persistence
- All data is stored locally in your browser
- Data persists across app sessions
- Each day has its own tracking history
- Goal settings are saved permanently

### Offline Support
- Works without internet connection after first load
- Service Worker caches all necessary files
- Perfect for use anywhere, anytime

### iOS Optimizations
- Standalone mode support
- Status bar integration
- Safe area inset support
- Touch-optimized interactions
- Prevents accidental zoom
- No address bar when installed

## Browser Support

- iOS Safari 11.3+
- Chrome (Android/Desktop)
- Edge (Desktop)
- Firefox (Desktop)
- Samsung Internet

## Customization

### Change Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4A90E2;
    --secondary-color: #67B7E8;
    /* ... more colors */
}
```

### Change Default Goal

Edit the default value in `app.js`:

```javascript
this.dailyGoal = 2000; // Change to your preferred default
```

### Modify Quick Add Amounts

Edit the HTML in `index.html`:

```html
<button class="add-btn" data-amount="100">
    <span class="icon">💧</span>
    <span>100ml</span>
</button>
```

## Privacy

- No data is sent to any server
- All data stays on your device
- No tracking or analytics
- No account required

---

Made with 💧 and ❤️
