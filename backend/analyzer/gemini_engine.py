"""
Google Gemini API integration for behavioral analysis
Detects emotional manipulation and social engineering tactics
"""
import json
import logging
from typing import Dict, Any
from utils.config import GOOGLE_API_KEY, DEMO_MODE, GEMINI_TIMEOUT
from utils.helpers import safe_json_parse, merge_flags

logger = logging.getLogger(__name__)

async def analyze_behavior(message: str) -> Dict[str, Any]:
    """
    Use Gemini to detect phishing behavior and emotional manipulation
    
    Returns:
    {
      "behavior_score": 0-100,
      "flags": ["urgency", "fear", ...],
      "evidence": {"urgency": "quote from message"},
      "explanation": "why dangerous"
    }
    """
    
    if DEMO_MODE:
        return _analyze_behavior_demo(message)
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        # Crafted prompt that forces JSON output
        system_prompt = """You are QShield AI, an expert in detecting social engineering and phishing attacks.
Your task is to analyze messages for manipulation tactics and emotional triggers.

Analyze the following message and respond ONLY with a valid JSON block (NO other text before or after):
{
  "behavior_score": <integer 0-100>,
  "flags": [<list of detected tactics as lowercase strings>],
  "evidence": {<tactic_name>: "<exact quote from message>"},
  "explanation": "<simple explanation in 1-2 sentences why this message is dangerous>"
}

Tactics to detect (lowercase):
- urgency (time pressure, "act now", deadlines)
- fear (threats, account closure, data loss)
- authority (impersonation of trusted entity, CEO, bank)
- greed (prizes, free money, rewards)
- trust (fake rapport, common pain points)
- sensitive_data_request (password, credit card, SSN)

Score interpretation:
- 0-30: Low risk (no tactics detected)
- 30-60: Medium risk (1-2 minor tactics)
- 60-85: High risk (multiple tactics, clear phishing)
- 85-100: Critical (all tactics present, sophisticated attack)

Message to analyze:
{} """
        
        prompt = system_prompt.format(message)
        
        response = model.generate_content(
            prompt,
            request_options={"timeout": GEMINI_TIMEOUT}
        )
        
        # Parse JSON from response
        result = safe_json_parse(response.text)
        
        # Validate response structure
        result = _validate_behavior_response(result)
        logger.info(f"Gemini analysis: score={result['behavior_score']}, flags={result['flags']}")
        
        return result
        
    except Exception as e:
        logger.warning(f"Gemini API error: {str(e)}, falling back to demo mode")
        # Fallback to demo mode for this request
        return _analyze_behavior_demo(message)

def _analyze_behavior_demo(message: str) -> Dict[str, Any]:
    """
    Demo behavioral analysis (no API call needed)
    Uses rule-based detection for testing
    """
    message_lower = message.lower()
    
    urgency_words = ["immediately", "urgent", "right now", "act now", "quickly", "asap", "within 24", "today only", "limited time"]
    fear_words = ["account will be", "closed", "blocked", "suspended", "locked", "compromised", "breached", "fraud", "danger"]
    authority_words = ["bank", "paypal", "amazon", "apple", "microsoft", "your account", "your bank", "from your", "official"]
    greed_words = ["won", "congratulations", "claim", "prize", "reward", "free", "bonus", "money", "cash"]
    sensitive_words = ["password", "credit card", "cvv", "ssn", "social security", "account number", "routing", "verify identity"]
    
    detected_flags = []
    evidence = {}
    
    # Check for urgency
    for word in urgency_words:
        if word in message_lower:
            detected_flags.append("urgency")
            evidence["urgency"] = word
            break
    
    # Check for fear  
    for word in fear_words:
        if word in message_lower:
            detected_flags.append("fear")
            evidence["fear"] = word
            break
    
    # Check for authority
    for word in authority_words:
        if word in message_lower:
            detected_flags.append("authority_impersonation")
            evidence["authority_impersonation"] = word
            break
    
    # Check for greed
    for word in greed_words:
        if word in message_lower:
            detected_flags.append("greed")
            evidence["greed"] = word
            break
    
    # Check for sensitive data request
    for word in sensitive_words:
        if word in message_lower:
            detected_flags.append("sensitive_data_request")
            evidence["sensitive_data_request"] = word
            break
    
    # Calculate score based on flags
    behavior_score = len(detected_flags) * 20
    if "sensitive_data_request" in detected_flags:
        behavior_score = min(100, behavior_score + 20)
    
    behavior_score = min(100, behavior_score)
    
    explanation = "This message contains phishing indicators. " if detected_flags else "This message appears legitimate. "
    if "sensitive_data_request" in detected_flags:
        explanation += "Do not share sensitive information."
    
    return {
        "behavior_score": behavior_score,
        "flags": detected_flags,
        "evidence": evidence,
        "explanation": explanation
    }

def _validate_behavior_response(response: dict) -> dict:
    """
    Ensure behavior response has required fields
    """
    if not isinstance(response, dict):
        return {
            "behavior_score": 0,
            "flags": [],
            "evidence": {},
            "explanation": "Invalid response format"
        }
    
    return {
        "behavior_score": max(0, min(100, response.get("behavior_score", 0))),
        "flags": response.get("flags", []),
        "evidence": response.get("evidence", {}),
        "explanation": response.get("explanation", "Analysis complete")
    }
