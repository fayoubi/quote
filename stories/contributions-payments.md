# User Story: Enhanced Contribution Page with Payment Configuration

**Module:** Enrollment - Contribution  
**Page:** `/enroll/contribution`  
**Priority:** High  
**Complexity:** Medium

---

## Overview

Enhance the contribution page to add French number-to-text conversion, restructure the layout into collapsible sections, and implement detailed payment configuration with validation.

---

## User Story

**As a** policyholder enrolling in a life insurance policy  
**I want to** configure my initial payment details with proper validation  
**So that** I can complete the enrollment process with accurate payment information

---

## Current State

The `/enroll/contribution` page currently shows:
- Annual contribution amount in numbers only
- Three information boxes (Montant Annuel, Périodicité, Prochain Paiement)
- A "Continuer Vers L'etape suivante" button

---

## Acceptance Criteria

### Section 1: Contribution Details (Enhanced)

- [ ] **AC1.1:** Annual amount is displayed in French text format below "Confirmation de la Contribution"
  - Format: "[Number in French text] Dirhams"
  - Example: 12000 MAD → "Douze Mille Dirhams"
  - Should handle amounts up to millions
  - Should be in proper French with correct capitalization

- [ ] **AC1.2:** Add heading "Détails de la Contribution" above the three existing boxes
  - Heading should be styled consistently with the design system
  - Three boxes remain: Montant Annuel, Périodicité, Prochain Paiement

- [ ] **AC1.3:** Button text changed from "Continuer Vers L'etape suivante" to "Configurer mes paiements"
  - Same styling as current button
  - On click: collapse Section 1 and show Section 2

- [ ] **AC1.4:** Section 1 becomes collapsible after "Configurer mes paiements" is clicked
  - Section collapses automatically when user proceeds
  - User can expand/collapse Section 1 manually after initial collapse
  - Collapsed state shows summary info (e.g., "Contribution Annuelle: [amount]")

### Section 2: Payment Configuration (New)

#### Versement Initial (Initial Payment)

- [ ] **AC2.1:** Display "Versement initial" section with two fields:
  - "Montant en chiffres" - numeric input field for MAD amount
  - "Montant en lettres" - auto-generated French text of the amount (read-only)

- [ ] **AC2.2:** Validate minimum amount
  - Minimum: 100 MAD (100 dirhams)
  - Show error message if amount < 100: "Le montant minimum est de 100 dirhams"
  - Follow existing validation pattern from the codebase
  - Validate on blur and on form submission

- [ ] **AC2.3:** Auto-convert numeric amount to French text
  - Update "Montant en lettres" in real-time as user types
  - Use same number-to-text function as AC1.1

#### Origine des Fonds (Fund Origin)

- [ ] **AC2.4:** Display "Origine des fonds" section with checkboxes:
  - [ ] Épargne sur les revenus annuels
  - [ ] Vente d'un bien immobilier
  - [ ] Vente de valeurs mobilières
  - [ ] Héritage
  - [ ] Autre (précisez impérativement)

- [ ] **AC2.5:** "Autre" checkbox behavior:
  - When "Autre" is checked: show text input field below
  - Text input placeholder: "Précisez l'origine des fonds"
  - When "Autre" is unchecked: hide text input field
  - If "Autre" is checked, text input is required (non-empty)

- [ ] **AC2.6:** At least one checkbox must be selected
  - Show error if user tries to proceed without selecting any option
  - Error message: "Veuillez sélectionner au moins une origine des fonds"

#### Mode de Paiement (Payment Mode)

- [ ] **AC2.7:** Display "Mode de paiement" section with two radio button options:
  - ○ Par chèque
  - ○ Par prélèvement bancaire

- [ ] **AC2.8:** Payment by Check ("Par chèque") - Show three required fields:
  - "Banque:" - text input for bank name
  - "Agence:" - text input for agency/branch name
  - "Numéro de chèque:" - text input for check number
  - All three fields are required when this option is selected
  - Validation: show error if any field is empty on submission

- [ ] **AC2.9:** Payment by Bank Draft ("Par prélèvement bancaire") - Show three required fields:
  - "Banque:" - text input for bank name
  - "Agence:" - text input for agency/branch name
  - "Numéro de compte:" - text input for RIB (24-digit account number)
  - All three fields are required when this option is selected

- [ ] **AC2.10:** RIB Validation for Bank Draft:
  - Validate RIB format: must be exactly 24 digits
  - Call API to validate RIB: `POST https://rib.ma/api/validate-rib`
  - Request body: `{"rib": "007810000012345678923468"}`
  - Show loading state during validation
  - On success: show green checkmark or success indicator
  - On failure: show error message: "Le RIB saisi est invalide. Veuillez vérifier et réessayer."
  - Documentation: https://rib.ma/fr
  - Validate on blur and before form submission

- [ ] **AC2.11:** One payment mode must be selected
  - Show error if user tries to proceed without selecting a payment mode
  - Error message: "Veuillez sélectionner un mode de paiement"

---

## Technical Requirements

### Number-to-French Text Conversion

```javascript
// Create utility function: /src/utils/numberToFrench.js
// Should handle numbers from 0 to 999,999,999
// Examples:
// 100 → "Cent"
// 12000 → "Douze Mille"
// 25750 → "Vingt-Cinq Mille Sept Cent Cinquante"
// 1000000 → "Un Million"
```

### RIB Validation API Integration

```javascript
// API Configuration
const RIB_VALIDATION_API = 'https://rib.ma/api/validate-rib';

// Request
POST /api/validate-rib
Headers: {
  'Content-Type': 'application/json'
}
Body: {
  "rib": "007810000012345678923468"
}

// Expected Response Format (check documentation at https://rib.ma/fr)
// Handle success/error cases appropriately
```

### Component Structure

```
/enroll/contribution
├── Section 1: Détails de la Contribution (collapsible)
│   ├── Confirmation heading + amount in text
│   ├── Three info boxes (existing)
│   └── "Configurer mes paiements" button
│
└── Section 2: Configuration des Paiements (initially hidden)
    ├── Versement Initial
    │   ├── Montant en chiffres (input)
    │   └── Montant en lettres (computed, read-only)
    │
    ├── Origine des Fonds
    │   └── Checkboxes with conditional "Autre" text field
    │
    └── Mode de Paiement
        ├── Radio: Par chèque
        │   └── Bank, Agency, Check Number fields
        │
        └── Radio: Par prélèvement bancaire
            └── Bank, Agency, RIB fields (with validation)
```

### State Management

- Track Section 1 collapsed/expanded state
- Track all form field values
- Track validation errors for each field
- Track RIB validation loading/success/error states
- Follow existing state management patterns in the codebase

### Validation Rules Summary

| Field | Rule | Error Message |
|-------|------|---------------|
| Versement Initial | >= 100 MAD | "Le montant minimum est de 100 dirhams" |
| Fund Origin | At least 1 selected | "Veuillez sélectionner au moins une origine des fonds" |
| Autre (if checked) | Non-empty text | "Veuillez préciser l'origine des fonds" |
| Payment Mode | 1 selected | "Veuillez sélectionner un mode de paiement" |
| Bank (both modes) | Non-empty | "Le nom de la banque est requis" |
| Agency (both modes) | Non-empty | "Le nom de l'agence est requis" |
| Check Number | Non-empty | "Le numéro de chèque est requis" |
| RIB | 24 digits + API validation | "Le RIB saisi est invalide. Veuillez vérifier et réessayer." |

---

## UI/UX Notes

- Maintain consistent styling with existing enrollment pages
- Use existing form components and validation patterns
- Ensure responsive design for mobile/tablet/desktop
- Add appropriate loading states for async operations (RIB validation)
- Use appropriate icons for success/error states
- Ensure smooth collapse/expand animations for Section 1
- Follow accessibility guidelines (WCAG 2.1)

---

## Testing Checklist

- [ ] Test number-to-French conversion for various amounts (100, 1000, 12000, 99999, etc.)
- [ ] Test Section 1 collapse/expand functionality
- [ ] Test minimum amount validation (99, 100, 101 MAD)
- [ ] Test fund origin checkbox selection (none, one, multiple, "Autre")
- [ ] Test "Autre" text field show/hide and validation
- [ ] Test payment mode selection and field visibility
- [ ] Test check payment with valid/invalid/empty fields
- [ ] Test draft payment with valid/invalid/empty fields
- [ ] Test RIB format validation (23 digits, 24 digits, 25 digits, non-numeric)
- [ ] Test RIB API validation with valid/invalid RIBs
- [ ] Test form submission with all validations
- [ ] Test error message display and clearing
- [ ] Test responsive layout on different screen sizes
- [ ] Test keyboard navigation and accessibility

---

## Dependencies

- Existing validation utilities in the codebase
- Number-to-French text conversion utility (to be created)
- RIB validation API (external service at https://rib.ma)
- Existing UI components and styling system

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests written for number-to-French conversion
- [ ] Integration tests for RIB validation
- [ ] Code reviewed and approved
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile devices
- [ ] Accessibility verified
- [ ] Documentation updated (if needed)
- [ ] Merged to development branch

---

## Notes

- Reference screenshot provided for Section 2 layout
- Follow existing patterns in `/enroll` flow for consistency
- Ensure all text is in French as per the EMEA market requirement
- Consider implementing debouncing for RIB API calls to avoid excessive requests