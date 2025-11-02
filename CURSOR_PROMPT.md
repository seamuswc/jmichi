# Japan Project Conversion Prompt

Convert this entire project from Thailand (Bangkok/Pattaya) to Japan. The site should be for JAPAN as a country, not specific cities.

## Key Changes Needed:

### 1. Remove City Switching Logic
- Remove all Bangkok/Pattaya city switching
- Make it a single Japan-focused site
- Update domain config to default to Japan coordinates (e.g., Tokyo center: 35.6762, 139.6503)
- Remove city selector buttons/functionality from data page and anywhere else

### 2. Language Changes
- Replace ALL Thai language (ภาษาไทย, กรุงเทพ, พัทยา, สร้าง, etc.) with Japanese (日本語)
- Keep English as the second language
- Bilingual should be: English & Japanese (not English & Thai)
- Update all UI text that currently shows Thai translations

### 3. Currency Change
- Change Thai Baht (฿) to Japanese Yen (¥)
- Update all price displays and formatting functions

### 4. Location References
- Replace "Thailand" with "Japan" everywhere
- Replace city-specific references with Japan country references
- Update SEO meta tags to say "Japan" instead of "Thailand" or specific cities
- Update coordinates to Japan (default: Tokyo area)

### 5. Specific Files to Update:
- `client/src/utils/domainConfig.js` - Japan coordinates, remove city switching
- `client/src/components/MapPage.jsx` - Remove city switching, update to Japan
- `client/src/components/AdvancedDataPage.jsx` - Remove city selector buttons
- `client/src/components/CreatePage.jsx` - Replace Thai text with Japanese
- `client/src/components/AuthPage.jsx` - Replace Thai with Japanese
- `client/index.html` - Update SEO tags for Japan
- `server/src/index.ts` - Update city detection logic for Japan regions
- All components with Thai text → Japanese text

### 6. Text Replacements Needed:
- Thai language button/labels → Japanese
- "Thai Baht" / "บาทไทย" → "Japanese Yen" / "日本円"
- "Bangkok"/"Pattaya" references → "Japan"
- "Thailand" → "Japan"
- All Thai placeholders/text → Japanese equivalents

### 7. Domain/Site Names
- Update site name references to Japan-focused
- Update any hardcoded domain references if needed

Make sure to preserve all functionality - only change the language, location references, and remove city switching. The site should work exactly the same way, just for Japan instead of Thailand cities.

