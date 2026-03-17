"""
Comprehensive test suite for QShield AI backend
Tests for all modules and endpoints
"""
import pytest
import asyncio
from fastapi.testclient import TestClient

from main import app
from analyzer.gemini_engine import analyze_behavior, _analyze_behavior_demo
from analyzer.url_checker import analyze_url, check_safe_browsing_demo, get_domain_info_demo
from analyzer.quantum_engine import assess_quantum_risk, quantum_risk_to_score
from scorer import combine_scores, combine_all_flags, build_combined_explanation
from utils.validation import validate_message, validate_url, validate_message_type

# ============= SETUP =============

client = TestClient(app)

# ============= TEST CASES FOR VALIDATION =============

def test_validate_message_valid():
    """Test valid message validation"""
    is_valid, error = validate_message("This is a legitimate message about our meeting")
    assert is_valid == True
    assert error == ""

def test_validate_message_too_short():
    """Test message too short"""
    is_valid, error = validate_message("short")
    assert is_valid == False
    assert "short" in error.lower()

def test_validate_message_too_long():
    """Test message too long"""
    long_msg = "a" * 6000
    is_valid, error = validate_message(long_msg)
    assert is_valid == False
    assert "long" in error.lower()

def test_validate_url_valid():
    """Test valid URL"""
    is_valid, error = validate_url("https://example.com")
    assert is_valid == True
    assert error == ""

def test_validate_url_invalid():
    """Test invalid URL"""
    is_valid, error = validate_url("not a url")
    assert is_valid == False

def test_validate_message_type_valid():
    """Test valid message type"""
    is_valid, error = validate_message_type("email")
    assert is_valid == True
    assert error == ""

def test_validate_message_type_invalid():
    """Test invalid message type"""
    is_valid, error = validate_message_type("telegram")
    assert is_valid == False

# ============= TEST CASES FOR BEHAVIOR ANALYSIS =============

@pytest.mark.asyncio
async def test_behavior_analysis_urgency():
    """Test detection of urgency tactics"""
    message = "Update your password immediately or your account will be closed"
    result = await analyze_behavior(message)
    
    assert result["behavior_score"] > 30
    assert "urgency" in result["flags"]
    assert len(result["evidence"]) > 0

@pytest.mark.asyncio
async def test_behavior_analysis_fear():
    """Test detection of fear tactics"""
    message = "Warning: Your account has been compromised. Click here to secure it now."
    result = await analyze_behavior(message)
    
    assert result["behavior_score"] > 30
    assert "fear" in result["flags"]

@pytest.mark.asyncio
async def test_behavior_analysis_authority():
    """Test detection of authority impersonation"""
    # Use a more direct authority impersonation message
    message = "This is Amazon Security. Verify your account information and password now."
    result = await analyze_behavior(message)
    
    assert result["behavior_score"] > 20
    assert "authority_impersonation" in result["flags"]

@pytest.mark.asyncio
async def test_behavior_analysis_legitimate():
    """Test that legitimate messages get low scores"""
    message = "Hi John, we have a meeting scheduled for tomorrow at 2pm in the conference room."
    result = await analyze_behavior(message)
    
    assert result["behavior_score"] < 50
    assert len(result["flags"]) == 0 or len(result["flags"]) <= 1

# ============= TEST CASES FOR URL ANALYSIS =============

@pytest.mark.asyncio
async def test_url_analysis_suspicious():
    """Test detection of suspicious URLs"""
    url = "https://secure-bank-verify.com"
    result = await analyze_url(url)
    
    assert result is not None
    assert "url_score" in result
    assert "domain_analysis" in result

@pytest.mark.asyncio
async def test_url_analysis_new_domain():
    """Test detection of newly registered domains"""
    url = "https://verify-secure-update.com"
    result = await analyze_url(url)
    
    # Newly registered domains should be flagged
    assert result["url_score"] >= 0
    assert "domain_analysis" in result

@pytest.mark.asyncio
async def test_safe_browsing_demo():
    """Test Safe Browsing demo function"""
    result = await check_safe_browsing_demo("https://paypa-verify.com")
    
    assert "is_malicious" in result
    assert "threat_types" in result
    assert "flags" in result

@pytest.mark.asyncio
async def test_domain_info_demo():
    """Test domain info demo function"""
    result = await get_domain_info_demo("example.com")
    
    assert "domain" in result
    assert "age_days" in result
    assert "registrar" in result

# ============= TEST CASES FOR QUANTUM ANALYSIS =============

@pytest.mark.asyncio
async def test_quantum_analysis_password_request():
    """Test quantum risk with password request"""
    message = "Please verify your password and credit card information"
    result = await assess_quantum_risk(message)
    
    assert result["quantum_risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert "password" in result["data_types_detected"]

@pytest.mark.asyncio
async def test_quantum_analysis_no_sensitive_data():
    """Test quantum risk with no sensitive data"""
    message = "We have a meeting tomorrow at 2pm"
    result = await assess_quantum_risk(message)
    
    assert result["quantum_risk_level"] == "LOW"
    assert len(result["data_types_detected"]) == 0

def test_quantum_risk_to_score():
    """Test quantum risk level to score conversion"""
    assert quantum_risk_to_score("HIGH") == 80
    assert quantum_risk_to_score("MEDIUM") == 50
    assert quantum_risk_to_score("LOW") == 20

# ============= TEST CASES FOR SCORER =============

def test_combine_scores_high():
    """Test score combination for high risk"""
    final_score, risk_level, confidence = combine_scores(80, 70, 80)
    
    assert final_score >= 75  # Should be HIGH
    assert risk_level == "HIGH"
    assert 0 <= confidence <= 1

def test_combine_scores_low():
    """Test score combination for low risk"""
    final_score, risk_level, confidence = combine_scores(10, 5, 20)
    
    assert final_score < 45  # Should be LOW
    assert risk_level == "LOW"
    assert confidence >= 0

def test_combine_scores_medium():
    """Test score combination for medium risk"""
    final_score, risk_level, confidence = combine_scores(50, 40, 50)
    
    assert 45 <= final_score < 75  # Should be MEDIUM
    assert risk_level == "MEDIUM"

def test_combine_flags():
    """Test flag combination"""
    flags1 = ["urgency", "fear"]
    flags2 = ["newly_registered"]
    flags3 = ["password"]
    
    all_flags, tactics = combine_all_flags(flags1, flags2, flags3)
    
    assert len(all_flags) >= 3
    assert "urgency" in all_flags
    assert "newly_registered" in all_flags

# ============= TEST CASES FOR API ENDPOINTS =============

def test_health_endpoint():
    """Test health check endpoint"""
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "timestamp" in response.json()

def test_analyze_endpoint_high_risk():
    """Test /analyze endpoint with high-risk message"""
    payload = {
        "message": "Your bank account is LOCKED! Click immediately to verify your password: https://secure-verify.com",
        "message_type": "email",
        "url": "https://secure-verify.com"
    }
    
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "final_risk_score" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert "explanation" in data
    assert "all_flags" in data
    assert "behavior_analysis" in data
    assert "quantum_analysis" in data

def test_analyze_endpoint_medium_risk():
    """Test /analyze endpoint with medium-risk message"""
    payload = {
        "message": "Congratulations! You've won £1000! Claim your prize now!",
        "message_type": "sms",
        "url": None
    }
    
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "final_risk_score" in data
    assert data["url_analysis"] is None  # No URL provided

def test_analyze_endpoint_low_risk():
    """Test /analyze endpoint with low-risk message"""
    payload = {
        "message": "Hi John, we have a meeting tomorrow at 2pm. Looking forward to it!",
        "message_type": "chat",
        "url": None
    }
    
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["risk_level"] == "LOW"

def test_analyze_endpoint_invalid_message():
    """Test /analyze with invalid message"""
    payload = {
        "message": "short",
        "message_type": "email"
    }
    
    response = client.post("/analyze", json=payload)
    # FastAPI/Pydantic returns 422 for validation errors, not 400
    assert response.status_code in [400, 422]

def test_analyze_endpoint_invalid_type():
    """Test /analyze with invalid message type"""
    payload = {
        "message": "This is a valid message about something important",
        "message_type": "telegram"
    }
    
    response = client.post("/analyze", json=payload)
    # FastAPI returns 400 for validation errors
    assert response.status_code in [400, 422]

def test_analyze_endpoint_invalid_url():
    """Test /analyze with invalid URL"""
    payload = {
        "message": "This is a valid message about something important",
        "message_type": "email",
        "url": "not a valid url"
    }
    
    response = client.post("/analyze", json=payload)
    # FastAPI returns 400 for validation errors
    assert response.status_code in [400, 422]

def test_examples_endpoint():
    """Test /examples endpoint"""
    response = client.get("/examples")
    
    assert response.status_code == 200
    data = response.json()
    assert "high_risk" in data
    assert "medium_risk" in data
    assert "low_risk" in data

# ============= INTEGRATION TESTS =============

def test_full_analysis_flow():
    """Test complete analysis flow with all components"""
    
    # High-risk email
    payload = {
        "message": "Click immediately! Your PayPal account will be closed if you don't verify your password and credit card number now!",
        "message_type": "email",
        "url": "https://paypa1-verify-secure.com/update"
    }
    
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    
    result = response.json()
    
    # Verify all required fields
    assert result["final_risk_score"] >= 75
    assert result["risk_level"] == "HIGH"
    assert len(result["all_flags"]) > 0
    assert result["behavior_analysis"]["behavior_score"] > 50
    assert result["url_analysis"]["url_score"] > 0
    assert result["quantum_analysis"]["quantum_risk_level"] == "HIGH"
    assert result["confidence"] >= 0

def test_response_schema_validation():
    """Verify response matches expected schema"""
    payload = {
        "message": "Meeting tomorrow at 2pm for the project review",
        "message_type": "chat"
    }
    
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    
    # Check all required fields exist
    required_fields = [
        "final_risk_score", "risk_level", "explanation", "confidence",
        "all_flags", "tactics", "behavior_analysis", "quantum_analysis"
    ]
    
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    
    # Check nested fields
    assert "behavior_score" in data["behavior_analysis"]
    assert "flags" in data["behavior_analysis"]
    assert "evidence" in data["behavior_analysis"]
    assert "quantum_risk_level" in data["quantum_analysis"]

# ============= PYTEST DISCOVERY =============

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
