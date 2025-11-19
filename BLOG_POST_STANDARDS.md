# Blog Post Standards - IngreGO.com

## Standardni proces za kreiranje blog postova

### 1. SEO Struktura

#### SEO Title (H1)
- **Format:** `Main Keyword Phrase | IngreGO Blog` (u frontmatter title)
- **Dužina:** 55-65 karaktera
- **Primer:** `7-Day Healthy Meal Plan Made Easy with AI | IngreGO Blog`
- **Napomena:** H1 u samom članku može biti bez "| IngreGO Blog" ako je to već u frontmatter title

#### Meta Description
- **Dužina:** 150-160 karaktera
- **Sadržaj:** Persuasive, sa call-to-action
- **Primer:** `Follow this simple 7-day AI-generated meal plan for healthy eating with no stress. Balanced, quick, and beginner-friendly meals that fit your lifestyle perfectly.`

#### URL Slug
- **Format:** `keyword-keyword-keyword` (lowercase, hyphens)
- **Primer:** `7-day-healthy-meal-plan-ai-easy`

#### Table of Contents
- Auto-generisan sa anchor linkovima
- Lista svih H2 sekcija
- **Format:** Može biti numerisano (`1. [Section Title](#section-title)`) ili bullet points (`- [Section Title](#section-title)`)
- **Preporuka:** Koristiti bullet points za konzistentnost

### 2. Slike (Ukupno 3)

#### Featured Image (1)
- **Lokacija:** Frontmatter `image: "/images/blog/keyword-keyword-keyword.svg"`
- **Format:** SVG placeholder (kreirati stvarnu placeholder sliku)
- **Naziv:** `keyword-keyword-keyword.svg` (SEO-optimizovan naziv sa glavnim keyword-ovima)
- **Dimenzije:** 1200x630px (og:image format)
- **Kreiranje:** Kreirati stvarnu placeholder sliku sa optimizovanim nazivom u `public/images/blog/`
- **Zamena:** Placeholder će se kasnije zameniti finalnom verzijom sa istim nazivom

#### In-Text Images (2)
- **Format:** SVG placeholder (kreirati stvarnu placeholder sliku) ili HTML komentar sa Seedream 4 promptom
- **Naziv:** `keyword-keyword-description.svg` (SEO-optimizovan naziv sa relevantnim keyword-ovima)
- **Dimenzije:** 1200x800px
- **Pozicioniranje:** Strategički raspoređene kroz tekst (ne na početku)
- **Opcija 1:** Direktan markdown sa stvarnom placeholder slikom: `![alt text](/images/blog/keyword-keyword-description.svg)`
- **Opcija 2:** HTML komentar placeholder (za buduće kreiranje):
  ```
  <!-- IMAGE 1
  FILENAME: slug-keyword.webp
  ALT: "keyword-rich description"
  PROMPT: Minimalistic Seedream-style cooking scene...
  -->
  ```

#### SEO-Optimizovan Naziv Slika
- **Format:** `keyword-keyword-keyword.svg` ili `keyword-keyword-description.svg`
- **Pravila:**
  - Samo lowercase slova
  - Reči odvojene crticama (hyphens)
  - Bez specijalnih karaktera
  - Bez razmaka
  - Uključiti glavne keyword-e iz članka
  - Maksimalno 50 karaktera
- **Primeri:**
  - Featured: `fridge-organization-tips-cooking-easier.svg`
  - In-text 1: `fridge-organization-zones-storage.svg`
  - In-text 2: `fridge-organization-leftovers-management.svg`

### 3. Struktura Članka

#### Introduction
- **Format:** Može biti eksplicitna `## Introduction` sekcija ili direktno tekst posle H1
- **Dužina:** 90-120 reči
- **Preporuka:** Eksplicitna sekcija za bolju organizaciju

#### Related Reading Sekcija
- **Format:** `### Related Reading` na kraju članka
- **Sadržaj:** 3-4 linka ka relevantnim blog postovima
- **Format linkova:** `- [Article Title](/blog/slug)`
- **Opciono:** Može se dodati za bolje interlinking

### 4. SVG Placeholder Standard

#### IngreGo Boje
- Primary: `#FF8C42` (Orange)
- Secondary: `#ffb46b` (Light Orange)
- Background: `#FBEED7` (Cream)
- Text: `#5F5F5F` (Dark Gray)

#### Template Struktura
```svg
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF8C42;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ffb46b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad1)"/>
  <!-- Content with IngreGo branding -->
</svg>
```

### 5. SEO Content Optimization

#### Headings
- **H2:** Mora sadržati keyword variations
- **H3:** Proširuje sekcije, bez dugih rečenica
- **Format:** Kratki, jasni naslovi bez filler fraza

#### Content Rules
- **Active voice:** Uvek koristiti aktivni glagolski oblik
- **Rečenice:** Maksimalno 20 reči po rečenici
- **Transition words:** Minimum 30% rečenica sa transition rečima
- **Bullet points:** Koristiti liste gde god je moguće
- **Numbered lists:** Za step-by-step procese

#### Internal Links (Obavezno)
- **Minimum 2 linka:**
  - `/scan` - ingredient scanning tool
  - `/meal-planner` - meal planning tool
- **Interlinking:** Linkovi ka relevantnim blog postovima (2-3 linka)

#### External Source (Obavezno)
- **1 authoritative source mention** (bez linka, samo ime)
- **Primeri:** Academy of Nutrition and Dietetics, Journal of Food Science, MIT Technology Review, American Heart Association

### 6. Frontmatter Template

```yaml
---
title: "SEO Title (55-65 chars)"
excerpt: "Meta Description (150-160 chars)"
date: "YYYY-MM-DD"
author: "IngreGo Team"
tags:
  - Tag 1
  - Tag 2
  - Tag 3
image: "/images/blog/keyword-keyword-keyword.svg"
---
```

### 7. Checklist Pre Publikacije

- [ ] SEO Title: 55-65 karaktera sa "| IngreGO Blog" (u frontmatter)
- [ ] Meta Description: 150-160 karaktera
- [ ] URL Slug: lowercase, hyphens, keyword-based
- [ ] Table of Contents: kompletan sa anchor linkovima
- [ ] Introduction: 90-120 reči (može biti eksplicitna sekcija)
- [ ] Featured Image: 1 SVG placeholder kreiran sa SEO-optimizovanim nazivom
- [ ] In-Text Images: 2 SVG placeholder-a kreirana sa SEO-optimizovanim nazivima (ili HTML komentari)
- [ ] Image nazivi: SEO-optimizovani (lowercase, hyphens, keyword-based, max 50 karaktera)
- [ ] H2 headings: sadrže keyword variations
- [ ] H3 headings: kratki, jasni
- [ ] Internal links: `/scan` i `/meal-planner` prisutni
- [ ] Interlinking: 2-3 linka ka drugim blog postovima
- [ ] Related Reading: Opciono, ali preporučeno (3-4 linka)
- [ ] External source: 1 mention (bez linka)
- [ ] Active voice: provereno kroz ceo tekst
- [ ] Rečenice: max 20 reči
- [ ] Transition words: minimum 30%
- [ ] Bullet/numbered lists: korišćene gde je relevantno
- [ ] CTA block: **NE UKLJUČIVATI** (uklonjen po zahtevu)

### 8. File Naming Convention

#### Blog Post
- Format: `keyword-keyword-keyword.md`
- Lokacija: `content/blog/`

#### Images
- Featured: `keyword-keyword-keyword.svg` (SEO-optimizovan naziv)
- In-text 1: `keyword-keyword-description.svg` (SEO-optimizovan naziv)
- In-text 2: `keyword-keyword-description.svg` (SEO-optimizovan naziv)
- Lokacija: `public/images/blog/`
- **Kreiranje:** Kreirati stvarne placeholder slike sa optimizovanim nazivima pre publikacije
- **Zamena:** Placeholder slike će se kasnije zameniti finalnim verzijama sa istim nazivima

### 9. Image Alt Text

- Format: `keyword keyword keyword` (prirodan opis)
- Primer: `7-day healthy meal plan AI balanced nutrition`

---

**Napomena:** Ovaj standard se primenjuje na sve naredne blog postove bez izuzetaka.




