# API Documentation

## Base URL

`https://adjudicator-backend.onrender.com`

## Authentication

Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Claims API

### Submit New Claim

**POST** `/claims/submit`

Upload medical documents for adjudication.

#### Request

- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `member_id` (string): Policy member ID
  - `member_name` (string): Member's name
  - `documents` (file[]): Medical documents (bills, prescriptions, etc.)
  - `claim_amount` (number): Claimed amount

#### Response

```json
{
  "claim_id": "CLM-ABC123",
  "verdict": "APPROVED",
  "claimed_amount": 2500.0,
  "approved_amount": 2250.0,
  "deductions": [
    {
      "amount": 250.0,
      "reason": "10% co-pay applied"
    }
  ],
  "confidence_score": 0.95,
  "rejection_reasons": [],
  "failed_rules": [],
  "decision_trace": [
    {
      "step": "Eligibility",
      "status": "PASS",
      "reason": "All administrative checks passed"
    }
  ],
  "notes": "Claim approved with standard co-pay deduction",
  "next_steps": "Payment will be processed within 3-5 business days"
}
```

### Get Claim Details

**GET** `/claims/{claim_id}`

Retrieve details of a specific claim.

#### Path Parameters

- `claim_id` (string): Unique claim identifier

#### Response

```json
{
  "claim_id": "CLM-ABC123",
  "member_id": "EMP001",
  "member_name": "Rajesh Kumar",
  "claim_data": {
    "treatment_date": "2024-11-01",
    "hospital_name": "Apollo Hospitals",
    "diagnosis": "Viral fever",
    "claimed_amount": 2500.0,
    "doctor_name": "Dr. Sharma",
    "doctor_reg_no": "KA/45678/2015",
    "is_network_hospital": true,
    "submission_files": ["https://storage.example.com/docs/bill_abc123.pdf"],
    "ai_confidence_score": 0.95
  },
  "decision": {
    "claim_id": "CLM-ABC123",
    "verdict": "APPROVED",
    "claimed_amount": 2500.0,
    "approved_amount": 2250.0,
    "deductions": [
      {
        "amount": 250.0,
        "reason": "10% co-pay applied",
        "rule_id": "CONSULTATION_COPAY"
      }
    ],
    "confidence_score": 0.95,
    "rejection_reasons": [],
    "failed_rules": [],
    "decision_trace": [
      {
        "step": "Eligibility",
        "status": "PASS",
        "reason": "All administrative checks passed"
      },
      {
        "step": "Coverage",
        "status": "PASS",
        "reason": "Treatment covered under policy"
      },
      {
        "step": "Limits",
        "status": "PASS",
        "reason": "Claim within sub-limits"
      }
    ],
    "notes": "Claim approved with standard co-pay deduction",
    "next_steps": "Payment will be processed within 3-5 business days",
    "action_item": null
  }
}
```

### List All Claims

**GET** `/claims/`

Retrieve a list of all claims (admin access required).

#### Query Parameters

- `limit` (integer, optional): Number of claims to return (default: 20)
- `offset` (integer, optional): Number of claims to skip (default: 0)
- `status` (string, optional): Filter by status (APPROVED, REJECTED, PENDING, MANUAL_REVIEW)

#### Response

```json
{
  "claims": [
    {
      "claim_id": "CLM-ABC123",
      "member_name": "Rajesh Kumar",
      "claimed_amount": 2500.0,
      "approved_amount": 2250.0,
      "status": "APPROVED",
      "submission_date": "2024-11-01T10:30:00Z",
      "decision_date": "2024-11-01T11:15:00Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

### Override Claim Decision (Manual Review)

**POST** `/claims/{claim_id}/override`

Manually override an AI decision (admin access required).

#### Path Parameters

- `claim_id` (string): Unique claim identifier

#### Request Body

```json
{
  "verdict": "APPROVED",
  "approved_amount": 2000.0,
  "notes": "Manual review completed - approving with reduced amount",
  "confidence_score": 1.0
}
```

#### Response

```json
{
  "claim_id": "CLM-ABC123",
  "verdict": "APPROVED",
  "approved_amount": 2000.0,
  "notes": "Manual review completed - approving with reduced amount",
  "confidence_score": 1.0,
  "status": "OVERRIDE_COMPLETED"
}
```

## Authentication API

### User Login

**POST** `/auth/login`

Authenticate user and get JWT token.

#### Request Body

```json
{
  "email": "admin@plum.com",
  "password": "securepassword"
}
```

#### Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "usr-123",
    "email": "admin@plum.com",
    "role": "admin",
    "name": "Admin User"
  }
}
```

### User Registration

**POST** `/auth/register`

Register a new user.

#### Request Body

```json
{
  "email": "newuser@plum.com",
  "password": "securepassword",
  "name": "New User",
  "role": "admin"
}
```

#### Response

```json
{
  "id": "usr-456",
  "email": "newuser@plum.com",
  "name": "New User",
  "role": "admin",
  "created_at": "2024-11-01T10:00:00Z"
}
```

### Get Current User

**GET** `/auth/me`

Get information about the currently authenticated user.

#### Response

```json
{
  "id": "usr-123",
  "email": "admin@plum.com",
  "name": "Admin User",
  "role": "admin",
  "created_at": "2024-10-01T09:00:00Z"
}
```

## Policy API

### Get Current Policy Terms

**GET** `/policy/terms`

Retrieve the current insurance policy terms.

#### Response

```json
{
  "policy_id": "PLUM_OPD_2024",
  "policy_name": "Plum OPD Advantage",
  "effective_date": "2024-01-01",
  "policy_holder": {
    "company": "TechCorp Solutions Pvt Ltd",
    "employees_covered": 500,
    "dependents_covered": true
  },
  "coverage_details": {
    "annual_limit": 50000,
    "per_claim_limit": 5000,
    "family_floater_limit": 150000,
    "consultation_fees": {
      "covered": true,
      "sub_limit": 2000,
      "copay_percentage": 10,
      "network_discount": 20
    },
    "diagnostic_tests": {
      "covered": true,
      "sub_limit": 10000,
      "pre_authorization_required": false,
      "covered_tests": [
        "Blood tests",
        "Urine tests",
        "X-rays",
        "ECG",
        "Ultrasound",
        "MRI (with pre-auth)",
        "CT Scan (with pre-auth)"
      ]
    }
  },
  "waiting_periods": {
    "initial_waiting": 30,
    "pre_existing_diseases": 365,
    "maternity": 270,
    "specific_ailments": {
      "diabetes": 90,
      "hypertension": 90,
      "joint_replacement": 730
    }
  },
  "exclusions": [
    "Cosmetic procedures",
    "Weight loss treatments",
    "Infertility treatments",
    "Experimental treatments",
    "Self-inflicted injuries"
  ],
  "claim_requirements": {
    "documents_required": [
      "Original bills and receipts",
      "Prescription from registered doctor",
      "Doctor's registration number must be visible",
      "Patient details must match policy records"
    ],
    "submission_timeline_days": 30,
    "minimum_claim_amount": 500
  }
}
```

## Health Check API

### Health Check

**GET** `/`

Check if the backend service is running.

#### Response

```json
{
  "status": "ok",
  "message": "Claim Adjudicator AI Backend Running",
  "timestamp": "2024-11-01T12:00:00Z"
}
```

## Error Responses

All API endpoints return standard error responses when something goes wrong:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- 100 requests per minute per IP address
- 10 file uploads per hour per user
