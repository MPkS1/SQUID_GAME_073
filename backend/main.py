"""
QShield AI Backend - FastAPI Application
Multi-engine phishing detection system
"""
import logging
import asyncio
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

from analyzer.gemini_engine import analyze_behavior
from analyzer.url_checker import analyze_url
from analyzer.quantum_engine import assess_quantum_risk, quantum_risk_to_score
from scorer import combine_scores, combine_all_flags, build_combined_explanation
from utils.validation import validate_message, validate_url, validate_message_type
from utils.config import BACKEND_HOST, BACKEND_PORT, DEBUG, FRONTEND_URL, DEMO_MODE
from utils.helpers import merge_flags, log_analysis, map_risk_level

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Print startup info
if DEMO_MODE:
    logger.info("🔧 Starting in DEMO MODE (using dummy API keys)")
else:
    logger.info("🚀 Starting with real API keys")

# ============= PYDANTIC MODELS =============

class AnalysisRequest(BaseModel):
    """Request model for /analyze endpoint"""
    message: str = Field(..., min_length=10, max_length=5000, description="Message to analyze")
    message_type: str = Field(..., description="Type: email, sms, chat, url")
    url: Optional[str] = Field(None, description="Optional URL to analyze")

class BehaviorAnalysis(BaseModel):
    """Behavioral analysis result"""
    behavior_score: int
    flags: list[str]
    evidence: dict
    explanation: str

class UrlAnalyst(BaseModel):
    """URL analysis result"""
    domain_age_days: int
    url_score: int
    flags: list[str]
    domain_analysis: dict

class QuantumAnalysis(BaseModel):
    """Quantum risk assessment result"""
    quantum_risk_level: str
    data_types_detected: list[str]
    vulnerable_encryption: str
    timeline: str
    explanation: str

class URLScannerResult(BaseModel):
    """URL Scanner analysis result"""
    urls_found: list[str]
    url_risks: dict
    domain_age_risk: str
    malware_status: str
    ssl_valid: bool

class CredentialHarvestingDetector(BaseModel):
    """Credential Harvesting analysis result"""
    credential_types_requested: list[str]
    credential_risk_level: str
    credential_score: int

class IndustryProfile(BaseModel):
    """Industry-specific risk profiling"""
    detected_industry: str
    industry_risk_multiplier: float
    common_attacks_for_industry: list[str]

class SimilarThreatMatch(BaseModel):
    """Similar threat matching result"""
    found_similar_threats: bool
    similar_count: int
    similar_threats: list[dict]
    match_percentage: int

class ThreatIntelligence(BaseModel):
    """Threat Intelligence Dashboard"""
    total_threats_analyzed: int
    average_risk_score: float
    top_threat_type: str
    top_origin_country: str
    threat_trend: str
    weekly_increase_percent: int

class AnomalyDetection(BaseModel):
    """Anomaly Detection Engine"""
    anomalies_detected: list[str]
    anomaly_score: int
    natural_language_score: int

class AttackPatternRecognition(BaseModel):
    """Attack Pattern Recognition"""
    attack_framework_detected: str
    framework_confidence_percent: int
    known_similar_attacks: int
    expected_follow_up: str

class AnalysisResponse(BaseModel):
    """Response model for /analyze endpoint"""
    final_risk_score: int
    risk_level: str
    explanation: str
    confidence: float
    all_flags: list[str]
    tactics: list[str]
    behavior_analysis: BehaviorAnalysis
    url_analysis: Optional[UrlAnalyst] = None
    quantum_analysis: QuantumAnalysis
    # New Features (6-16)
    url_scanner: Optional[URLScannerResult] = None
    credential_harvesting: Optional[CredentialHarvestingDetector] = None
    industry_profile: Optional[IndustryProfile] = None
    similar_threats: Optional[SimilarThreatMatch] = None
    threat_intelligence: Optional[ThreatIntelligence] = None
    anomaly_detection: Optional[AnomalyDetection] = None
    attack_pattern: Optional[AttackPatternRecognition] = None
    safe_response_template: Optional[str] = None
    emergency_contacts: Optional[list[dict]] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    demo_mode: bool

# ============= ANALYSIS HELPER FUNCTIONS =============

def extract_urls(message: str) -> list[str]:
    """Extract URLs from message"""
    import re
    url_pattern = r'https?://[^\s\])]+'
    return re.findall(url_pattern, message)

def analyze_url_scanner(message: str, urls: list[str]) -> dict:
    """FEATURE 6: URL Scanner - Check URL reputation"""
    if not urls:
        return None
    
    url_risks = {}
    malware_detected = False
    
    for url in urls:
        # Simulate domain age analysis
        risk = "HIGH" if "verify" in url or "confirm" in url or "update" in url else "MEDIUM"
        url_risks[url] = {
            "risk_level": risk,
            "domain_age_days": 3 if risk == "HIGH" else 180,
            "ssl_valid": "verify" not in url.lower(),
            "malware_status": "SUSPICIOUS" if "bit.ly" in url or "short" in url else "CLEAN"
        }
        if risk == "HIGH":
            malware_detected = True
    
    return {
        "urls_found": urls,
        "url_risks": url_risks,
        "domain_age_risk": "CRITICAL" if any(r["domain_age_days"] < 30 for r in url_risks.values()) else "LOW",
        "malware_status": "DETECTED" if malware_detected else "CLEAN",
        "ssl_valid": not malware_detected
    }

def analyze_credential_harvesting(message: str) -> dict:
    """FEATURE 8: Credential Harvesting Detector"""
    credentials_patterns = {
        "password": ["password", "passwd", "pwd", "secret"],
        "otp": ["otp", "code", "verification code", "2fa", "two-factor"],
        "credit_card": ["credit card", "card number", "cvv", "expir"],
        "bank_account": ["account number", "routing number", "iban"],
        "ssn": ["social security", "ssn", "tax id"],
        "pin": ["pin", "personal identification"],
        "account_verification": ["verify your", "confirm your", "verify account", "confirm account", "update account", "verify details", "account information"],
        "urgent_threat": ["suspended", "locked", "disabled", "deactivated", "unauthorized", "unusual activity"]
    }
    
    message_lower = message.lower()
    detected = []
    max_severity = 0
    severity_map = {
        "pin": 1, 
        "ssn": 2, 
        "credit_card": 2, 
        "bank_account": 2, 
        "otp": 3, 
        "password": 4,
        "account_verification": 3,
        "urgent_threat": 3
    }
    
    for cred_type, keywords in credentials_patterns.items():
        if any(kw in message_lower for kw in keywords):
            detected.append(cred_type)
            max_severity = max(max_severity, severity_map.get(cred_type, 1))
    
    severity_levels = {0: "NONE", 1: "LOW", 2: "MEDIUM", 3: "HIGH", 4: "CRITICAL"}
    risk_scores = {0: 0, 1: 20, 2: 50, 3: 75, 4: 95}
    
    return {
        "credential_types_requested": detected,
        "credential_risk_level": severity_levels.get(max_severity, "NONE"),
        "credential_score": risk_scores.get(max_severity, 0)
    }

def analyze_industry_profile(message: str, message_type: str) -> dict:
    """FEATURE 9: Industry-Specific Risk Profiling"""
    message_lower = message.lower()
    
    industries = {
        "banking": {
            "keywords": ["bank", "account", "wire", "transfer", "swift", "routing"],
            "multiplier": 1.8,
            "attacks": ["Account verification", "Credential harvesting", "Wire fraud"]
        },
        "ecommerce": {
            "keywords": ["amazon", "ebay", "paypal", "order", "shipping", "tracking"],
            "multiplier": 1.5,
            "attacks": ["Account suspension", "Fake shipment", "Billing fraud"]
        },
        "corporate": {
            "keywords": ["ceo", "boss", "executive", "employee", "payroll", "invoice"],
            "multiplier": 2.0,
            "attacks": ["BEC (Business Email Compromise)", "CEO fraud", "Impersonation"]
        },
        "healthcare": {
            "keywords": ["patient", "medical", "hospital", "insurance", "prescription"],
            "multiplier": 1.9,
            "attacks": ["HIPAA breach", "Insurance fraud", "Patient data theft"]
        },
        "government": {
            "keywords": ["government", "irs", "tax", "social security", "federal"],
            "multiplier": 1.7,
            "attacks": ["Tax fraud", "Benefit scams", "Official impersonation"]
        }
    }
    
    detected_industry = "general"
    multiplier = 1.0
    attacks = []
    
    for industry, data in industries.items():
        if any(kw in message_lower for kw in data["keywords"]):
            detected_industry = industry
            multiplier = data["multiplier"]
            attacks = data["attacks"]
            break
    
    return {
        "detected_industry": detected_industry,
        "industry_risk_multiplier": multiplier,
        "common_attacks_for_industry": attacks
    }

def analyze_similar_threats(message: str, risk_score: int) -> dict:
    """FEATURE 10: Similar Threat Matching - Mock Database"""
    # Simulated threat database
    threat_db = [
        {
            "date": "2025-11-15",
            "message": "Your Amazon account has been locked",
            "type": "Account verification",
            "score": 85,
            "similarity": 0.89
        },
        {
            "date": "2025-10-22",
            "message": "Urgent: Verify your PayPal account immediately",
            "type": "Credential harvesting",
            "score": 78,
            "similarity": 0.76
        },
        {
            "date": "2025-09-10",
            "message": "Click to confirm your banking information",
            "type": "Bank account verification",
            "score": 90,
            "similarity": 0.72
        }
    ]
    
    # Simple similarity matching
    message_words = set(message.lower().split())
    similar = []
    
    for threat in threat_db:
        threat_words = set(threat["message"].lower().split())
        if len(message_words & threat_words) > 3:
            similar.append({
                "date": threat["date"],
                "message": threat["message"],
                "type": threat["type"],
                "score": threat["score"]
            })
    
    return {
        "found_similar_threats": len(similar) > 0,
        "similar_count": len(similar),
        "similar_threats": similar[:3],
        "match_percentage": int((len(message_words & set(threat_db[0]["message"].lower().split())) / len(message_words)) * 100) if message_words else 0
    }

def analyze_threat_intelligence() -> dict:
    """FEATURE 11: Threat Intelligence Dashboard - Mock Stats"""
    return {
        "total_threats_analyzed": 4892,
        "average_risk_score": 52,
        "top_threat_type": "Vishing (Voice Phishing)",
        "top_origin_country": "Nigeria",
        "threat_trend": "RISING",
        "weekly_increase_percent": 240
    }

def analyze_anomalies(message: str, behavior_score: int) -> dict:
    """FEATURE 12: Anomaly Detection Engine"""
    anomalies = []
    anomaly_score = 0
    
    message_lower = message.lower()
    
    # Check for unusual patterns
    if len(message) > 500:
        anomalies.append("Unusually long message")
        anomaly_score += 10
    
    # Excessive urgency markers
    exclamation_count = message.count("!")
    all_caps_words = len([w for w in message.split() if w.isupper() and len(w) > 2])
    
    if exclamation_count > 3:
        anomalies.append(f"Excessive urgency markers ({exclamation_count}!)")
        anomaly_score += 25
    
    if all_caps_words > 2:
        anomalies.append("Multiple words in ALL CAPS")
        anomaly_score += 20
    
    if message.isupper() or sum(1 for c in message if c.isupper()) > len(message) * 0.4:
        anomalies.append("Unusual capitalization pattern")
        anomaly_score += 15
    
    # Time pressure indicators
    time_pressure_keywords = ["within 24 hours", "immediate", "immediately", "urgent", "asap", "quickly", "soon", "before", "expires in", "limited time"]
    if any(kw in message_lower for kw in time_pressure_keywords):
        anomalies.append("Time pressure/urgency language detected")
        anomaly_score += 30
    
    # Threat/coercion language
    threat_keywords = ["suspended", "locked", "disabled", "terminated", "deactivated", "restricted", "violated", "unauthorized"]
    if any(kw in message_lower for kw in threat_keywords):
        anomalies.append("Account threat/coercion language")
        anomaly_score += 30
    
    # Generic greeting (mass phishing indicator)
    generic_greetings = ["dear customer", "dear user", "dear member", "hello", "to whom it may concern"]
    if any(greeting in message_lower for greeting in generic_greetings):
        anomalies.append("Generic greeting (mass email indicator)")
        anomaly_score += 15
    
    # Suspicious call-to-action
    suspicious_cta = ["verify", "confirm", "click", "update", "re-confirm", "authenticate", "validate"]
    cta_count = sum(1 for cta in suspicious_cta if cta in message_lower)
    if cta_count >= 2:
        anomalies.append(f"Multiple suspicious call-to-action phrases")
        anomaly_score += 25
    elif cta_count == 1:
        anomalies.append("Suspicious call-to-action language")
        anomaly_score += 15
    
    # Poor grammar/formatting indicators
    if "  " in message:  # Double spaces (often from templates)
        anomalies.append("Suspicious formatting (template-like)")
        anomaly_score += 10
    
    # Natural language score (inverse of behavior score)
    natural_language_score = max(0, 100 - behavior_score)
    
    return {
        "anomalies_detected": anomalies,
        "anomaly_score": min(100, anomaly_score),
        "natural_language_score": natural_language_score
    }

def analyze_attack_patterns(message: str, behavior_score: int, all_flags: list) -> dict:
    """FEATURE 13: Attack Pattern Recognition"""
    patterns = {
        "pretexting": {
            "keywords": ["verify", "confirm", "update", "account", "suspended", "locked", "unusual activity", "security"],
            "name": "Pretexting Attack"
        },
        "bec": {
            "keywords": ["ceo", "boss", "executive", "urgent", "wire", "transfer", "invoice", "payment"],
            "name": "BEC (Business Email Compromise)"
        },
        "smishing": {
            "keywords": ["sms", "text", "click", "verify", "code", "otp"],
            "name": "Smishing (SMS Phishing)"
        },
        "vishing": {
            "keywords": ["call", "phone", "voice", "otp", "bank", "account"],
            "name": "Vishing (Voice Phishing)"
        },
        "spear": {
            "keywords": ["personalized", "targeted", "specific", "know", "you"],
            "name": "Spear Phishing"
        },
        "account_takeover": {
            "keywords": ["account", "verify", "suspended", "locked", "disabled", "confirm", "details"],
            "name": "Account Takeover Attempt"
        }
    }
    
    message_lower = message.lower()
    detected_pattern = "Unknown"
    confidence = 0
    expected_followup = "Unknown"
    
    # Match patterns (find best match)
    best_match = None
    best_score = 0
    
    for pattern_key, pattern_data in patterns.items():
        matches = sum(1 for kw in pattern_data["keywords"] if kw in message_lower)
        pattern_score = (matches / len(pattern_data["keywords"])) * 100 if pattern_data["keywords"] else 0
        
        if pattern_score > best_score:
            best_score = pattern_score
            best_match = pattern_key
            confidence = int(pattern_score)
            detected_pattern = pattern_data["name"]
    
    # Expected follow-up mapping
    followup_map = {
        "pretexting": "Request for account details, passwords, or personal information",
        "bec": "Request for wire transfer or sensitive company data",
        "smishing": "Click link or confirm personal information via text",
        "vishing": "Request for verification code, password, or account PIN",
        "spear": "Credential or payment request tailored to target",
        "account_takeover": "Request to verify identity or click verification link"
    }
    
    if best_match:
        expected_followup = followup_map.get(best_match, "Request for sensitive information or action")
    
    return {
        "attack_framework_detected": detected_pattern,
        "framework_confidence_percent": confidence,
        "known_similar_attacks": 1247 if confidence > 40 else 42,
        "expected_follow_up": expected_followup
    }

def generate_safe_response() -> str:
    """FEATURE 15: Safe Response Generator"""
    return """Dear Sender,

Thank you for your message. Before proceeding with any requests, I want to ensure this communication is legitimate. I will:

1. Verify your identity through official channels (company website, known phone number, or in-person)
2. Never provide passwords, personal information, or sensitive data via email
3. Contact your organization directly if I have any concerns

If this is a legitimate request, please reach out to me through known, verified channels. If you are a legitimate service provider, I recommend contacting me through the official company support page or my organization's verified contact methods.

Best regards"""

def get_emergency_contacts() -> list[dict]:
    """FEATURE 16: Emergency Contacts Panel"""
    return [
        {
            "name": "FBI IC3 (Cyber Crime)",
            "url": "https://ic3.gov",
            "icon": "🇺🇸",
            "description": "Internet Crime Complaint Center"
        },
        {
            "name": "FTC Fraud Report",
            "url": "https://reportfraud.ftc.gov",
            "icon": "🔺",
            "description": "Federal Trade Commission"
        },
        {
            "name": "APWG Database",
            "url": "https://www.apwg.org",
            "icon": "📊",
            "description": "Anti-Phishing Working Group"
        },
        {
            "name": "Microsoft Safety",
            "url": "https://safety.microsoft.com",
            "icon": "🔒",
            "description": "Report account compromise"
        },
        {
            "name": "Google Safe Browsing",
            "url": "https://safebrowsing.google.com/safebrowsing/report_phishing",
            "icon": "🔍",
            "description": "Report phishing website"
        }
    ]

# ============= FASTAPI APP SETUP =============

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info(f"🛡️  QShield AI Backend starting on {BACKEND_HOST}:{BACKEND_PORT}")
    if DEMO_MODE:
        logger.warning("⚠️  DEMO MODE - Using simulated analysis (no real API calls)")
    logger.info(f"✅ CORS enabled for: {FRONTEND_URL}")
    yield
    logger.info("🛑 QShield AI Backend shutting down")

app = FastAPI(
    title="QShield AI Backend",
    description="Phishing detection with behavioral, URL, and quantum analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= ENDPOINTS =============

@app.get("/health")
async def health_check():
    """Health check endpoint for frontend and Chrome extension"""
    return {
        "status": "online" if DEMO_MODE else "healthy",
        "service": "QShield AI Backend",
        "version": "3.0",
        "timestamp": datetime.now().isoformat(),
        "demo_mode": DEMO_MODE,
        "api_available": True
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest) -> AnalysisResponse:
    """
    Main analysis endpoint
    
    Analyzes a message/URL for phishing using 3 parallel engines:
    1. Behavioral analysis (Gemini API)
    2. URL validation (Safe Browsing + WHOIS)
    3. Quantum risk assessment
    """
    
    try:
        # Validate input
        is_valid, error = validate_message(request.message)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Message validation: {error}")
        
        is_valid, error = validate_message_type(request.message_type)
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Message type validation: {error}")
        
        if request.url:
            is_valid, error = validate_url(request.url)
            if not is_valid:
                raise HTTPException(status_code=400, detail=f"URL validation: {error}")
        
        logger.info(f"📨 Analyzing {request.message_type}: {request.message[:50]}...")
        
        # Run 3 analysis engines in parallel
        behavior_task = analyze_behavior(request.message)
        quantum_task = assess_quantum_risk(request.message)
        
        # Conditionally run URL analysis
        if request.url:
            url_task = analyze_url(request.url)
            behavior, quantum, url_analysis = await asyncio.gather(
                behavior_task, quantum_task, url_task
            )
        else:
            behavior, quantum = await asyncio.gather(behavior_task, quantum_task)
            url_analysis = None
        
        # Extract scores
        behavior_score = behavior.get("behavior_score", 0)
        url_score = url_analysis.get("url_score", 0) if url_analysis else 0
        quantum_score = quantum_risk_to_score(quantum.get("quantum_risk_level", "LOW"))
        
        # Combine scores
        final_score, risk_level, confidence = combine_scores(
            behavior_score, url_score, quantum_score
        )
        
        # Combine flags
        all_flags, tactics = combine_all_flags(
            behavior.get("flags", []),
            url_analysis.get("flags", []) if url_analysis else [],
            quantum.get("data_types_detected", [])
        )
        
        # ===== NEW FEATURES ANALYSIS (BEFORE FINAL SCORE) =====
        # Extract URLs
        urls = extract_urls(request.message)
        
        # FEATURE 6: URL Scanner
        url_scanner_result = analyze_url_scanner(request.message, urls) if urls else None
        
        # FEATURE 8: Credential Harvesting
        credential_harvesting_result = analyze_credential_harvesting(request.message)
        
        # FEATURE 9: Industry Profile
        industry_profile_result = analyze_industry_profile(request.message, request.message_type)
        
        # FEATURE 10: Similar Threats
        similar_threats_result = analyze_similar_threats(request.message, final_score)
        
        # FEATURE 11: Threat Intelligence
        threat_intel_result = analyze_threat_intelligence()
        
        # FEATURE 12: Anomaly Detection
        anomaly_result = analyze_anomalies(request.message, behavior_score)
        
        # FEATURE 13: Attack Pattern Recognition
        attack_pattern_result = analyze_attack_patterns(request.message, behavior_score, all_flags)
        
        # ===== APPLY THREAT MULTIPLIERS TO FINAL SCORE =====
        # Boost score if multiple threat indicators detected
        threat_multiplier = 1.0
        
        # Credential harvesting boost (30% increase per type)
        if credential_harvesting_result.get("credential_types_requested"):
            cred_count = len(credential_harvesting_result.get("credential_types_requested", []))
            threat_multiplier += (cred_count * 0.30)  # Up to +90% for 3+ types
        
        # High credential risk multiplier
        if credential_harvesting_result.get("credential_risk_level") == "CRITICAL":
            threat_multiplier += 0.40
        elif credential_harvesting_result.get("credential_risk_level") == "HIGH":
            threat_multiplier += 0.20
        
        # Anomaly detection boost
        anomaly_score = anomaly_result.get("anomaly_score", 0)
        if anomaly_score > 50:
            threat_multiplier += 0.25  # +25% for high anomaly
        elif anomaly_score > 25:
            threat_multiplier += 0.15  # +15% for medium anomaly
        
        # Attack pattern boost (confidence-based)
        attack_confidence = attack_pattern_result.get("framework_confidence_percent", 0)
        if attack_confidence > 70:
            threat_multiplier += 0.35  # +35% for high confidence pattern
        elif attack_confidence > 40:
            threat_multiplier += 0.20  # +20% for medium confidence
        
        # Industry risk multiplier
        industry_multiplier = industry_profile_result.get("industry_risk_multiplier", 1.0)
        threat_multiplier *= industry_multiplier
        
        # Similar threats boost
        similar_count = similar_threats_result.get("similar_count", 0)
        if similar_count > 0:
            threat_multiplier += (similar_count * 0.15)  # +15% per similar threat
        
        # Apply multiplier with cap at 100
        adjusted_final_score = min(100, int(final_score * threat_multiplier))
        
        # Use adjusted score if threat multiplier increased it, otherwise keep original
        if adjusted_final_score > final_score:
            final_score = adjusted_final_score
            risk_level = map_risk_level(final_score)
            logger.info(f"⚠️  Score boosted by threat multipliers: {adjusted_final_score}/100")
        
        # Build explanation
        explanation = build_combined_explanation(
            behavior.get("explanation", ""),
            url_analysis,
            quantum.get("explanation", ""),
            behavior.get("flags", [])
        )
        
        # Log result
        log_analysis(request.message, final_score, risk_level)
        
        # FEATURE 15: Safe Response
        safe_response = generate_safe_response()
        
        # FEATURE 16: Emergency Contacts
        emergency_contacts = get_emergency_contacts()
        
        # Build response
        response = AnalysisResponse(
            final_risk_score=final_score,
            risk_level=risk_level,
            explanation=explanation,
            confidence=confidence,
            all_flags=all_flags,
            tactics=tactics,
            behavior_analysis=BehaviorAnalysis(
                behavior_score=behavior_score,
                flags=behavior.get("flags", []),
                evidence=behavior.get("evidence", {}),
                explanation=behavior.get("explanation", "")
            ),
            url_analysis=UrlAnalyst(
                domain_age_days=url_analysis.get("domain_age_days", -1),
                url_score=url_score,
                flags=url_analysis.get("flags", []),
                domain_analysis=url_analysis.get("domain_analysis", {})
            ) if url_analysis else None,
            quantum_analysis=QuantumAnalysis(
                quantum_risk_level=quantum.get("quantum_risk_level", "LOW"),
                data_types_detected=quantum.get("data_types_detected", []),
                vulnerable_encryption=quantum.get("vulnerable_encryption", "N/A"),
                timeline=quantum.get("timeline", "N/A"),
                explanation=quantum.get("explanation", "")
            ),
            # New features
            url_scanner=URLScannerResult(**url_scanner_result) if url_scanner_result else None,
            credential_harvesting=CredentialHarvestingDetector(**credential_harvesting_result),
            industry_profile=IndustryProfile(**industry_profile_result),
            similar_threats=SimilarThreatMatch(**similar_threats_result),
            threat_intelligence=ThreatIntelligence(**threat_intel_result),
            anomaly_detection=AnomalyDetection(**anomaly_result),
            attack_pattern=AttackPatternRecognition(**attack_pattern_result),
            safe_response_template=safe_response,
            emergency_contacts=emergency_contacts
        )
        
        logger.info(f"✅ Analysis complete: score={final_score}, level={risk_level}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Analysis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/examples")
async def get_examples():
    """Get example phishing messages for demo"""
    return {
        "high_risk": [
            {
                "message": "Your Bank Account is LOCKED! Click immediately to verify your identity: https://secure-bank-update.com/verify",
                "message_type": "email",
                "url": "https://secure-bank-update.com"
            },
            {
                "message": "PayPal: Confirm your password and credit card to avoid account suspension",
                "message_type": "sms",
                "url": None
            }
        ],
        "medium_risk": [
            {
                "message": "Congratulations! You've won £1000! Claim your prize now: https://prize-claim-uk.webnode.com",
                "message_type": "sms",
                "url": "https://prize-claim-uk.webnode.com"
            }
        ],
        "low_risk": [
            {
                "message": "Hi John, just following up on our meeting tomorrow at 2pm. Looking forward to discussing the project!",
                "message_type": "chat",
                "url": None
            }
        ]
    }

# ============= CHROME EXTENSION ENDPOINTS =============

class PhishingReport(BaseModel):
    """Phishing report model"""
    url: str
    risk_score: int
    timestamp: Optional[str] = None
    source: str = "chrome_extension"

@app.post("/report-phishing")
async def report_phishing(report: PhishingReport):
    """Accept phishing reports from Chrome extension"""
    logger.info(f"🚨 Phishing reported: {report.url} | Risk: {report.risk_score}/100")
    
    # Log to file for analysis
    with open("phishing_reports.log", "a") as f:
        f.write(f"{report.timestamp or datetime.now().isoformat()} | {report.url} | {report.risk_score}\n")
    
    return {
        "success": True,
        "message": "Thank you for reporting this phishing link! It will help us protect other users.",
        "report_id": f"PHI-{datetime.now().timestamp()}",
        "timestamp": datetime.now().isoformat()
    }

#  ============= ERROR HANDLERS =============

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# ============= MAIN =============

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=DEBUG,
        log_level="info"
    )
