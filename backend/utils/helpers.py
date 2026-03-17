"""
Helper functions for QShield AI backend
"""
import json
import logging
from typing import Any

logger = logging.getLogger(__name__)

def safe_json_parse(text: str) -> dict:
    """
    Safely parse JSON from text
    Handles malformed JSON by extracting valid JSON block
    """
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to extract JSON from text if wrapped in other content
        import re
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                pass
        return {}

def map_risk_level(score: int) -> str:
    """
    Map risk score (0-100) to risk level
    """
    if score >= 75:
        return "HIGH"
    elif score >= 45:
        return "MEDIUM"
    else:
        return "LOW"

def calculate_confidence(score: int, max_score: int = 100) -> float:
    """
    Calculate confidence level based on score
    Returns 0.0-1.0
    """
    if max_score == 0:
        return 0.0
    
    confidence = (score / max_score)
    # Add uncertainty factor (0.7-1.0 range)
    # Extreme scores (0 or 100) are more confident
    if score == 0 or score == max_score:
        return min(1.0, confidence + 0.15)
    
    return min(1.0, max(0.5, confidence))

def format_explanation(behavior_exp: str, url_exp: str = "", quantum_exp: str = "") -> str:
    """
    Combine multiple explanations into one user-friendly explanation
    """
    parts = [behavior_exp]
    
    if url_exp:
        parts.append(url_exp)
    
    if quantum_exp:
        parts.append(quantum_exp)
    
    # Join with space, remove duplicates
    explanation = " ".join([p.strip() for p in parts if p and p.strip()])
    return explanation

def get_tactic_severity(tactic: str) -> int:
    """
    Get severity score (0-100) for a tactic
    Higher severity means more dangerous
    """
    severity_map = {
        "urgency": 90,
        "fear": 85,
        "authority_impersonation": 95,
        "sensitive_data_request": 100,
        "greed": 70,
        "trust": 60,
        "malware_detected": 100,
        "phishing_suspected": 90,
        "newly_registered_domain": 75,
        "suspicious_domain": 80,
        "unverified_claim": 50,
    }
    return severity_map.get(tactic, 50)

def merge_flags(flag_lists: list[list[str]]) -> list[str]:
    """
    Merge multiple flag lists, removing duplicates and maintaining order
    """
    seen = set()
    result = []
    for flags in flag_lists:
        for flag in flags:
            if flag not in seen:
                seen.add(flag)
                result.append(flag)
    return result

def log_analysis(message: str, score: int, risk_level: str):
    """Log analysis results"""
    msg_preview = message[:100] if len(message) > 100 else message
    logger.info(f"Analysis: score={score}, level={risk_level}, message={msg_preview}")
