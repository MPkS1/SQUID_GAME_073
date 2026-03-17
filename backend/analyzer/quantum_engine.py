"""
Quantum computing risk assessment
Analyzes vulnerability of encrypted data to quantum computing threats
"""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def assess_quantum_risk(message: str) -> Dict[str, Any]:
    """
    Assess quantum computing threat to this message
    Based on sensitive data types detected
    
    Returns:
    {
      "quantum_risk_level": "HIGH/MEDIUM/LOW",
      "data_types_detected": ["password", "credit_card"],
      "vulnerable_encryption": "RSA-2048",
      "timeline": "2035-2040",
      "explanation": "..."
    }
    """
    
    message_lower = message.lower()
    
    # Indicators for different sensitive data types
    password_indicators = [
        "password", "pwd", "pass", "verify identity", "confirm password",
        "secret", "code", "pin", "passphrase"
    ]
    
    financial_indicators = [
        "credit card", "bank", "routing", "account number", "card number",
        "cvv", "swift", "iban", "atm", "debit"
    ]
    
    identity_indicators = [
        "ssn", "social security", "driver license", "passport",
        "date of birth", "dob", "mother's maiden"
    ]
    
    # Check for each data type
    data_types_detected = []
    
    if any(ind in message_lower for ind in password_indicators):
        data_types_detected.append("password")
    
    if any(ind in message_lower for ind in financial_indicators):
        data_types_detected.append("financial_data")
    
    if any(ind in message_lower for ind in identity_indicators):
        data_types_detected.append("identity_data")
    
    # Determine risk level based on sensitive data
    if len(data_types_detected) >= 2:
        risk_level = "HIGH"
        explanation = "Multiple sensitive data types detected. Both RSA (for asymmetric encryption) and AES (for symmetric encryption) are vulnerable to quantum computing. RSA encryption protecting passwords and financial data will be broken by quantum computers by 2035-2040."
    elif "password" in data_types_detected or "financial_data" in data_types_detected:
        risk_level = "MEDIUM"
        explanation = "Sensitive data detected. Current encryption (RSA/AES) is vulnerable to quantum computers within 15 years. Consider using post-quantum cryptography standards like Kyber for key exchange."
    else:
        risk_level = "LOW"
        explanation = "No sensitive personal or financial data detected. Generic phishing threat is minimal from quantum computing perspective."
    
    return {
        "quantum_risk_level": risk_level,
        "data_types_detected": data_types_detected,
        "vulnerable_encryption": "RSA-2048 / AES-256" if data_types_detected else "N/A",
        "timeline": "2035-2040 (RSA vulnerable)" if risk_level in ["HIGH", "MEDIUM"] else "N/A",
        "explanation": explanation
    }

def quantum_risk_to_score(risk_level: str) -> int:
    """
    Convert quantum risk level to score for combining with other scores
    """
    mapping = {
        "HIGH": 80,
        "MEDIUM": 50,
        "LOW": 20
    }
    return mapping.get(risk_level, 20)
