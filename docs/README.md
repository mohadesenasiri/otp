# OTP Signal - Multilingual Landing Page

A modern, minimal, and fully responsive landing page for Signal OTP service with seamless multilingual support.

## 🌍 Supported Languages

- **فارسی (Farsi)** - Default language, RTL layout
- **English** - LTR layout
- **العربية (Arabic)** - RTL layout

## ✨ Features

### Design
- Modern, minimal UI with clean aesthetics
- Gradient backgrounds and smooth animations
- Card-based layout with hover effects
- Floating image animations
- Responsive design for all devices
- No inline styles - all CSS in separate file

### Multilingual Support
- Seamless language switching without page reload
- Automatic RTL/LTR layout adjustment
- Language preference saved in localStorage
- Smooth font family transitions
- Maintains layout integrity across all languages

### Responsive Design
- Mobile-first approach
- Breakpoints: 1024px, 768px, 480px
- Fluid typography using `clamp()`
- Adaptive grid layouts
- Touch-friendly language switcher

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Focus states for all interactive elements
- Reduced motion support for users with motion sensitivity
- Proper ARIA attributes

## 📁 File Structure

```
otpnew/
├── index.html          # Main HTML file with data-i18n attributes
├── style.css           # All styling (modern, minimal design)
├── translations.js     # Translation strings for all languages
├── app.js             # Language switching functionality
├── api.js             # API integration with secure authentication
├── server.js          # Backend server with JWT authentication
├── 001.png            # Hero section image
├── 002.png            # Connect section image
├── .env.example       # Example environment variables
├── .env               # Environment variables (gitignored)
├── README.md          # Main documentation
├── README-SECURITY.md # Security enhancements documentation
└── README-OTP.md      # OTP service documentation
```

## 🚀 How to Use

1. Open `index.html` in a browser
2. Click on language buttons (فارسی, English, العربية) in top-right corner
3. Page automatically switches language and layout direction
4. Language preference is saved for next visit

## 🔧 How Language Switching Works

### HTML Structure
Each translatable text element has a `data-i18n` attribute:
```html
<h1 data-i18n="hero.title.part1">ارسال</h1>
```

### Translation System
1. **translations.js** - Contains all translations organized by language and key
2. **app.js** - Handles language switching logic
3. Click language button → Updates HTML lang/dir → Translates all elements → Saves preference

### Layout Adaptation
- **RTL Languages (Farsi, Arabic)**: Right-to-left layout, right-aligned text
- **LTR Languages (English)**: Left-to-right layout, left-aligned text
- Centered elements remain centered in all languages

## 🎨 Design System

### Colors
- Primary: `#22c55e` (Green)
- Secondary: `#3b82f6` (Blue)
- Background: `#ffffff` (White)
- Text: `#1a202c` (Dark Gray)
- Accent: Gradient combinations

### Typography
- RTL: Vazirmatn, Vazir, Tahoma, Arial
- LTR: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

### Spacing
- Sections: 8rem padding (responsive)
- Cards: 2.5rem padding
- Gaps: 1rem - 4rem based on context

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: 480px - 768px
- **Small Mobile**: < 480px

## 🔄 Adding New Languages

1. Add translation to `translations.js`:
```javascript
translations.xx = {
  hero: {
    title: { part1: "...", part2: "...", part3: "..." },
    // ... rest of translations
  }
}
```

2. Add language button in HTML:
```html
<button class="lang-btn" data-lang="xx">Language Name</button>
```

3. Update title mapping in `app.js`:
```javascript
const titles = {
  xx: 'Your Page Title'
};
```

4. Set text direction (if RTL):
```javascript
const dir = (lang === 'fa' || lang === 'ar' || lang === 'xx') ? 'rtl' : 'ltr';
```

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Enhancements

This project includes several security improvements to protect sensitive data:

- **JWT Authentication**: API endpoints are protected with JWT tokens
- **Environment Variables**: Sensitive data stored in `.env` file
- **Token Management**: Automatic token generation and validation
- **Secure Headers**: Proper HTTP headers for security
- **Input Validation**: Server-side validation of all inputs

See [README-SECURITY.md](README-SECURITY.md) for detailed security documentation.

## 📝 Notes

- All original text content preserved exactly as provided
- No external dependencies except AOS (scroll animations)
- localStorage used for language persistence
- Smooth transitions between language changes
- Layout never breaks regardless of language

## 🛠️ Customization

### Change Colors
Edit CSS variables in `style.css`:
- Primary gradient: `#22c55e` → `#16a34a`
- Secondary gradient: `#3b82f6` → `#2563eb`

### Modify Animations
Edit AOS settings in `app.js`:
```javascript
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});
```

### Update Content
Modify translations in `translations.js` for each language

---

Built with ❤️ for Signal OTP Service
