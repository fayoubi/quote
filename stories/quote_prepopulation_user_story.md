# User Story: Quote to Application Prepopulation

## 📋 User Story

**As a** prospective insurance customer  
**I want** my quote details (Date of Birth and City) to be automatically carried over when I start an application  
**So that** I don't have to re-enter information I already provided during the quote process

## 🎯 Background Context

- Current flow: User generates quote at `http://localhost:3001/` → User clicks "Apply" → User starts fresh application form
- Problem: Users must re-enter Date of Birth and City information they already provided in the quote
- Solution: Preserve and prepopulate these specific fields from quote to application

## ✅ Acceptance Criteria

### Primary Requirements

1. **Quote Data Persistence**
   - [ ] When a user completes a quote on `http://localhost:3001/`, store Date of Birth and City in session/state
   - [ ] Data should persist when user navigates from quote page to application page

2. **Application Prepopulation**
   - [ ] When user clicks "Apply" from quote page, redirect to application with prepopulated data
   - [ ] Date of Birth field should be automatically filled with quote data
   - [ ] City field should be automatically filled with quote data
   - [ ] Prepopulated fields should be editable (user can still modify if needed)

3. **Data Handling**
   - [ ] If Date of Birth exists in quote data → prepopulate application field
   - [ ] If Date of Birth is null/empty → leave application field empty
   - [ ] If City exists in quote data → prepopulate application field  
   - [ ] If City is null/empty → leave application field empty

4. **User Experience**
   - [ ] Prepopulated fields should be visually indicated (subtle styling/placeholder text)
   - [ ] User should be able to clear and modify prepopulated values
   - [ ] No error should occur if quote data is unavailable

### Technical Requirements

5. **Data Transfer Mechanism**
   - [ ] Implement data persistence between quote and application (URL params, session storage, or state management)
   - [ ] Ensure data is only passed for the current user session
   - [ ] Clear quote data after successful application submission or session timeout

6. **Route Handling**
   - [ ] Modify "Apply" button/link to pass quote data to application route
   - [ ] Application route should accept and process quote data parameters
   - [ ] Handle direct navigation to application (without quote data) gracefully

## 🔧 Technical Implementation Notes

### Data Flow
```
Quote Page (localhost:3001) 
  ↓ [User enters DOB & City]
  ↓ [Generate Quote]
  ↓ [User clicks "Apply"]
  ↓ [Pass data via URL params/session]
Application Page
  ↓ [Check for quote data]
  ↓ [Prepopulate DOB & City fields]
  ↓ [User completes application]
```

### Suggested Implementation Approach

1. **Quote Page Changes**
   - Capture Date of Birth and City when quote is generated
   - Modify "Apply" button to include data in navigation
   - Store data in session storage as backup

2. **Application Page Changes**
   - Check for incoming quote data on page load
   - Prepopulate form fields with available data
   - Handle missing/null data gracefully

3. **Data Structure**
   ```javascript
   const quoteData = {
     dateOfBirth: "1990-01-15" | null,
     city: "New York" | null
   }
   ```

## 🧪 Testing Scenarios

### Happy Path
- [ ] User completes quote with DOB and City → clicks Apply → both fields prepopulated
- [ ] User modifies prepopulated fields → can save application successfully

### Edge Cases
- [ ] User completes quote with only DOB → clicks Apply → only DOB prepopulated
- [ ] User completes quote with only City → clicks Apply → only City prepopulated
- [ ] User navigates directly to application → no prepopulation, fields empty
- [ ] User refreshes application page → prepopulated data persists
- [ ] Multiple users/tabs → data doesn't cross-contaminate between sessions

### Error Handling
- [ ] Invalid date format in quote → application handles gracefully
- [ ] Session expires between quote and application → no errors, fields empty
- [ ] User clicks Apply without completing quote → application loads normally

## 📝 Definition of Done

- [ ] Date of Birth from quote prepopulates in application form
- [ ] City from quote prepopulates in application form  
- [ ] Fields remain editable after prepopulation
- [ ] Null/empty values handled without errors
- [ ] Data persistence works across page navigation
- [ ] All test scenarios pass
- [ ] Code reviewed and merged
- [ ] Feature tested on localhost:3001 environment

## 🚀 Additional Considerations

- **Privacy**: Ensure quote data is only accessible to the originating user session
- **Performance**: Minimize data payload passed between pages
- **Accessibility**: Ensure prepopulated fields work with screen readers
- **Future Enhancement**: Consider expanding to other quote fields (coverage amount, term length)

---

**Priority**: Medium  
**Estimated Effort**: 2-3 hours  
**Dependencies**: Current quote and application form implementations