# 🛡️ QShield AI Backend

FastAPI-based phishing detection engine with behavioral analysis, URL validation, and quantum risk assessment.

## Quick Start

### 1. Setup Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure API Keys

```bash
# Copy example config
cp .env.example .env

# Edit .env and add your API keys (optional for demo)
# GOOGLE_API_KEY=your-key-here
# GOOGLE_SAFE_BROWSING_API_KEY=your-key-here
```

### 4. Run Backend

```bash
python main.py
```

Server will start on: **http://localhost:8000**

Auto-generated API docs: **http://localhost:8000/docs**

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-17T10:30:45",
  "demo_mode": true
}
```

### POST /analyze
Main analysis endpoint

**Request:**
```json
{
  "message": "Your bank account is locked. Click to verify: https://bank-update.com",
  "message_type": "email",
  "url": "https://bank-update.com"
}
```

**Response:**
```json
{
  "final_risk_score": 87,
  "risk_level": "HIGH",
  "explanation": "This message shows multiple red flags...",
  "confidence": 0.89,
  "all_flags": ["urgency", "authority_impersonation", "sensitive_data_request"],
  "tactics": ["urgency", "authority_impersonation"],
  "behavior_analysis": {
    "behavior_score": 82,
    "flags": ["urgency", "authority_impersonation", "sensitive_data_request"],
    "evidence": {"urgency": "click to verify"},
    "explanation": "..."
  },
  "url_analysis": {
    "domain_age_days": 3,
    "url_score": 92,
    "flags": ["newly_registered", "suspicious_domain"],
    "domain_analysis": {
      "domain": "bank-update.com",
      "is_suspicious": true,
      "threat_types": ["SOCIAL_ENGINEERING"],
      "registrar": "GoDaddy"
    }
  },
  "quantum_analysis": {
    "quantum_risk_level": "HIGH",
    "data_types_detected": ["password", "financial_data"],
    "vulnerable_encryption": "RSA-2048",
    "timeline": "2035-2040",
    "explanation": "..."
  }
}
```

### GET /examples
Get example phishing messages for demo

## Architecture

### 3-Engine Analysis System

1. **Behavioral Analysis (Gemini)**
   - Detects emotional manipulation
   - Identifies tactics (urgency, fear, greed, authority)
   - Generates human-readable explanations

2. **URL Validation (Safe Browsing + WHOIS)**
   - Checks against malicious URL database
   - Analyzes domain age
   - Detects newly registered/suspicious domains

3. **Quantum Risk Assessment**
   - Identifies sensitive data (passwords, credit cards)
   - Assesses encryption vulnerability
   - Provides quantum threat timeline

### Scoring Formula

```
final_score = (behavior_score × 0.40) + (url_score × 0.40) + (quantum_score × 0.20)
```

## Module Structure

```
backend/
├── main.py                    # FastAPI app & endpoints
├── analyzer/
│   ├── gemini_engine.py      # Behavioral analysis
│   ├── url_checker.py        # URL validation
│   └── quantum_engine.py     # Quantum risk
├── utils/
│   ├── config.py             # Configuration & API keys
│   ├── validation.py         # Input validation
│   └── helpers.py            # Helper functions
├── scorer.py                 # Score combination
└── requirements.txt          # Dependencies
```

## Testing

### Run All Tests

```bash
pytest test_backend.py -v
```

### Run Specific Tests

```bash
# Test validation
pytest test_backend.py::test_validate_message_valid -v

# Test API endpoints
pytest test_backend.py::test_analyze_endpoint_high_risk -v

# Test in parallel
pytest test_backend.py -v -n auto
```

### Test Coverage

```bash
pip install pytest-cov
pytest test_backend.py --cov=. --cov-report=html
```

## Configuration

### Environment Variables

```bash
# Google APIs
GOOGLE_API_KEY=your-key
GOOGLE_SAFE_BROWSING_API_KEY=your-key

# Server
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DEBUG=true

# CORS
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=INFO
```

### Demo Mode

Backend runs in **DEMO MODE** by default:
- Uses simulated analysis (no real API calls)
- Perfect for testing and development
- No API keys required

To use real APIs:
1. Get API keys from Google
2. Add to .env file
3. Backend automatically switches to real mode

## Performance

- **Analysis time:** ~2-5 seconds (parallel execution)
- **Response time:** <1 second (from cached results)
- **Free tier limits:** 50 Gemini/day, 10K Safe Browsing/month
- **Production ready:** Yes (with proper error handling)

## Frontend Integration

Backend is fully integrated with React frontend.

**Frontend expects:**
- `POST /analyze` endpoint with specific request/response format
- CORS enabled for localhost:5173
- Health check on startup

**Test integration:**

```bash
# Terminal 1: Run backend
python main.py

# Terminal 2: Run frontend
cd ../frontend
npm run dev

# Terminal 3: Navigate to
http://localhost:5173
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| ImportError for analyzers | Check import paths, must run from backend/ folder |
| "No module named google" | Run `pip install google-generativeai` |
| CORS errors | Check FRONTEND_URL in .env, should match frontend origin |
| Tests failing | Ensure pytest and pytest-asyncio installed |
| localhost:8000 refused | Check if port 8000 is already in use |

## Development Notes

- All async functions use `asyncio.gather()` for parallel execution
- Input validation happens at Pydantic model level
- Demo mode enabled by default (use dummy API keys)
- Logging to console with timestamps
- Error handling graceful (degraded responses vs failures)

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 main:app --bind 0.0.0.0:8000
```

### Using Docker

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

```bash
docker build -t qshield-ai-backend .
docker run -p 8000:8000 -e GOOGLE_API_KEY=xxx qshield-ai-backend
```

## API Keys

### Get Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy and paste into .env

### Get Safe Browsing API Key
1. Go to https://console.cloud.google.com/
2. Create new project
3. Search for "Safe Browsing API"
4. Enable and create API key
5. Copy and paste into .env

## License

Part of QShield AI project for hackathon 2026
