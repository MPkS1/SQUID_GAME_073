"""
Scoring module: combines results from 3 engines into final risk score
"""
import logging
from typing import Tuple
from utils.helpers import map_risk_level, calculate_confidence, merge_flags

logger = logging.getLogger(__name__)

def combine_scores(
    behavior_score: int,
    url_score: int,
    quantum_score: int
) -> Tuple[int, str, float]:
    """
    Combine scores from 3 engines into final risk score
    
    Weights:
    - Behavioral (Gemini): 40%
    - URL validation: 40%
    - Quantum importance: 20%
    
    Args:
        behavior_score: 0-100 from Gemini
        url_score: 0-100 from Safe Browsing + WHOIS
        quantum_score: 0-100 from quantum risk
    
    Returns:
        (final_score, risk_level, confidence)
    """
    
    # Validate inputs
    behavior_score = max(0, min(100, int(behavior_score)))
    url_score = max(0, min(100, int(url_score)))
    quantum_score = max(0, min(100, int(quantum_score)))
    
    # Weighted combination
    final_score = int(
        (behavior_score * 0.4) +
        (url_score * 0.4) +
        (quantum_score * 0.2)
    )
    
    final_score = max(0, min(100, final_score))
    
    # Get risk level
    risk_level = map_risk_level(final_score)
    
    # Calculate confidence
    confidence = calculate_confidence(final_score)
    
    logger.info(
        f"Score combination: behavior={behavior_score}, "
        f"url={url_score}, quantum={quantum_score} → "
        f"final={final_score}, level={risk_level}, confidence={confidence:.2f}"
    )
    
    return final_score, risk_level, confidence

def combine_all_flags(
    behavior_flags: list,
    url_flags: list,
    quantum_flags: list
) -> Tuple[list, list]:
    """
    Combine flags from all sources and determine main tactics
    
    Returns:
        (all_flags, main_tactics)
    """
    
    all_flags = merge_flags([
        behavior_flags or [],
        url_flags or [],
        quantum_flags or []
    ])
    
    # Determine main tactics (behavior flags are primary)
    main_tactics = behavior_flags or []
    
    return all_flags, main_tactics

def build_combined_explanation(
    behavior_explanation: str,
    url_analysis: dict,
    quantum_explanation: str,
    behavior_flags: list
) -> str:
    """
    Build combined explanation from all sources
    """
    parts = []
    
    if behavior_explanation:
        parts.append(behavior_explanation)
    
    if url_analysis and url_analysis.get("url_score", 0) > 50:
        domain = url_analysis.get("domain_analysis", {}).get("domain", "this domain")
        age = url_analysis.get("domain_age_days", -1)
        if age >= 0 and age < 7:
            parts.append(f"The URL domain ({domain}) was registered recently ({age} days ago), which is suspicious.")
        elif url_analysis.get("domain_analysis", {}).get("threat_types"):
            threats = ", ".join(url_analysis["domain_analysis"]["threat_types"])
            parts.append(f"This URL has been flagged as {threats}.")
    
    if quantum_explanation and "detected" in quantum_explanation.lower():
        parts.append(quantum_explanation)
    
    combined = " ".join(parts)
    
    # Add final recommendation
    if "sensitive" in combined.lower() or len(behavior_flags) >= 2:
        combined += " Do not click links or share personal information."
    
    return combined.strip()
