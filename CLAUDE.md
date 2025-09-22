# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm start
```

**Build for production:**
```bash
npm run build
```

**Run tests:**
```bash
npm test
```

**Install dependencies:**
```bash
npm install
```

## Project Architecture

This is a React 18 + TypeScript insurance quote application for TwinzTech, targeting Morocco/Europe markets. The application follows European conventions (DD/MM/YYYY dates, metric units).

### Core Structure
- **Framework:** React 18 with TypeScript, built on Create React App
- **Styling:** Tailwind CSS with custom color scheme (blue primary, green accent)
- **Routing:** React Router v6 with four main routes:
  - `/` - Quote form (QuoteForm.tsx)
  - `/quote` - Quote display (QuoteDisplay.tsx)
  - `/contact` - Contact page (ContactPage.tsx)
  - `/enroll/start` - Insurance enrollment form (InsuranceForm.tsx)

### Key Components
- **QuoteForm**: Main insurance quote form with Moroccan cities, metric units (cm/kg), European date format
- **InsuranceForm**: Complex enrollment form with nationality/country selection, person data collection
- **QuoteDisplay**: Shows calculated quotes and insurance options
- **Header**: Navigation component with routing

### Data Models
- Quote form uses `QuoteFormData` interface with gender, birthdate (DD/MM/YYYY), height (cm), weight (kg), city, nicotine usage
- Insurance form uses `Person` type with comprehensive personal data including nationality, address, occupation
- Nationality data stored in `constants/nationalitiesFr.ts` (French labels)
- City data includes top 10 Moroccan cities by population

### Technical Conventions
- **Variables:** camelCase (heightCm, weightKg, usesNicotine)
- **Components:** PascalCase (QuoteForm, InsuranceForm)
- **Files:** PascalCase for components, camelCase for utilities
- **Dates:** European DD/MM/YYYY format throughout
- **Units:** Metric system (centimeters, kilograms)
- **Strict TypeScript:** Full type safety with interfaces for all data structures

### Regional Context
- **Location:** Morocco/Europe focused
- **Cities:** Top 10 Moroccan cities (Casablanca, Rabat, Fez, Marrakech, etc.)
- **Language:** English with French nationality labels
- **Currency/Units:** Metric system, European date formatting
- **Design:** Blue/green color scheme, Inter font family

### Form Flow
1. User fills quote form with personal data and location
2. Application calculates insurance quotes
3. User can view quotes and proceed to enrollment
4. Enrollment form collects comprehensive personal/legal data
5. Contact page provides company information

When working with this codebase, maintain the European/Moroccan regional context, metric units, DD/MM/YYYY date formatting, and the established TypeScript patterns.