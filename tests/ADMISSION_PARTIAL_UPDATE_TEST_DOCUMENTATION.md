# Admission Partial Update API - Test Cases & Error Messages

## Overview
This document outlines the test cases, payloads, and error messages for the Admission Partial Update API endpoint: `PATCH /api/modules/admissions/{id}/partial`

## API Endpoint
```
PATCH /api/modules/admissions/{id}/partial
```

## Validation Rules

### 1. finalFee Protection
- **Rule**: `finalFee` cannot be updated through partial updates
- **Reason**: finalFee can only be set during admission creation

### 2. Installments Total Validation
- **Rule**: Sum of all installment fees must equal the existing `finalFee`
- **Tolerance**: 0.01 (for floating point precision)
- **Validation**: Only applies when `installments` array is provided

## Test Cases & Payloads

### ✅ Valid Test Cases

#### Test Case 1: Update Installments (Valid Total)
```json
// Request Payload
{
  "installments": [
    {"installment1Fee": 6000, "status": "paid"},
    {"installment2Fee": 4000, "status": "pending"}
  ]
}

// Expected Response: 200 OK
{
  "dateOfAdmission": "2025-01-15T00:00:00.000Z",
  "studentId": "...",
  "academicYear": 2025,
  "finalFee": 10000,
  "installments": [
    {"installment1Fee": 6000, "status": "paid"},
    {"installment2Fee": 4000, "status": "pending"}
  ],
  // ... other fields
}
```

#### Test Case 2: Update Other Fields (Non-finalFee, Non-installments)
```json
// Request Payload
{
  "discount": 500,
  "discountApproved": true,
  "taskIds": ["task1", "task2"]
}

// Expected Response: 200 OK
{
  "discount": 500,
  "discountApproved": true,
  "taskIds": ["task1", "task2"],
  // ... other fields unchanged
}
```

#### Test Case 3: Empty Installments Array
```json
// Request Payload
{
  "installments": []
}

// Expected Response: 200 OK
// (Validation skipped when installments array is empty)
```

### ❌ Error Test Cases

#### Test Case 4: Attempt to Update finalFee
```json
// Request Payload
{
  "finalFee": 15000
}

// Expected Error Response: 400 Bad Request
{
  "status": 400,
  "message": "finalFee cannot be updated through partial update. finalFee can only be set during admission creation."
}
```

#### Test Case 5: Installments Total Exceeds finalFee
```json
// Request Payload (existing finalFee = 10000)
{
  "installments": [
    {"installment1Fee": 7000, "status": "paid"},
    {"installment2Fee": 4000, "status": "pending"}
  ]
}

// Expected Error Response: 400 Bad Request
{
  "status": 400,
  "message": "Total installments fee (11000) must equal finalFee (10000)"
}
```

#### Test Case 6: Installments Total Below finalFee
```json
// Request Payload (existing finalFee = 10000)
{
  "installments": [
    {"installment1Fee": 3000, "status": "paid"},
    {"installment2Fee": 4000, "status": "pending"}
  ]
}

// Expected Error Response: 400 Bad Request
{
  "status": 400,
  "message": "Total installments fee (7000) must equal finalFee (10000)"
}
```

#### Test Case 7: Invalid Admission ID
```json
// Request Payload
{
  "discount": 500
}

// URL: PATCH /api/modules/admissions/invalid-id/partial

// Expected Error Response: 404 Not Found
{
  "status": 404,
  "message": "Admission not found"
}
```

#### Test Case 8: Invalid Field Values (Joi Validation)
```json
// Request Payload
{
  "academicYear": "invalid-year",
  "discount": -100
}

// Expected Error Response: 422 Unprocessable Entity
{
  "status": 422,
  "message": "\"academicYear\" must be a number"
}
```

### 🔄 Edge Cases

#### Test Case 9: Installments with Different Fee Field Names
```json
// Request Payload (existing finalFee = 10000)
{
  "installments": [
    {"fee1": 6000, "status": "paid"},
    {"customFee": 4000, "status": "pending"}
  ]
}

// Expected Response: 200 OK
// (Only fields containing "Fee" are summed: customFee = 4000)
```

#### Test Case 10: Floating Point Precision
```json
// Request Payload (existing finalFee = 10000.00)
{
  "installments": [
    {"installment1Fee": 3333.33, "status": "paid"},
    {"installment2Fee": 3333.33, "status": "pending"},
    {"installment3Fee": 3333.34, "status": "pending"}
  ]
}

// Expected Response: 200 OK
// (3333.33 + 3333.33 + 3333.34 = 10000.00, within 0.01 tolerance)
```

#### Test Case 11: Installments with Zero/Missing Fees
```json
// Request Payload (existing finalFee = 5000)
{
  "installments": [
    {"installment1Fee": 5000, "status": "paid"},
    {"installment2Fee": 0, "status": "cancelled"},
    {"installment3Fee": null, "status": "pending"}
  ]
}

// Expected Response: 200 OK
// (Only non-zero, valid fees are summed: 5000 + 0 + 0 = 5000)
```

## Validation Logic Flow

```
1. Parse request body with Joi partial schema
2. Check if finalFee is present in request
   ├── YES → Throw 400: "finalFee cannot be updated through partial update"
   └── NO → Continue
3. Check if installments array is provided
   ├── YES → Calculate total installments fee
   │         Compare with existing finalFee (from database)
   │         ├── Within tolerance (≤0.01) → Continue
   │         └── Outside tolerance → Throw 400: "Total installments fee (X) must equal finalFee (Y)"
   └── NO → Skip validation
4. Update document with provided fields
5. Return updated document
```

## Error Message Patterns

| Scenario | HTTP Status | Error Message Pattern |
|----------|-------------|----------------------|
| finalFee update attempt | 400 | `"finalFee cannot be updated through partial update. finalFee can only be set during admission creation."` |
| Installments total mismatch | 400 | `"Total installments fee ({calculated}) must equal finalFee ({existing})"` |
| Admission not found | 404 | `"Admission not found"` |
| Joi validation failure | 422 | `"\"{field}\" {validation error}"` |
| Server error | 500 | `"Internal server error"` |

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/admission.partial.update.test.js

# Run tests in watch mode
npm run test:watch
```

## Notes

- All monetary values are handled with floating point precision tolerance of 0.01
- Fee field detection uses regex pattern: fields containing "Fee" but not exactly "status"
- Partial updates only modify provided fields; other fields remain unchanged
- finalFee protection ensures data integrity by preventing unauthorized fee changes
- Installments validation maintains the constraint that total fees always equal the original finalFee</content>
<parameter name="filePath">d:\Main\git-repos\isc\isc-unifiedplatform-backend\tests\ADMISSION_PARTIAL_UPDATE_TEST_DOCUMENTATION.md