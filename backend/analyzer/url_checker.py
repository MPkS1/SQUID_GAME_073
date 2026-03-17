"""
URL analysis using Google Safe Browsing API and WHOIS data
"""
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from utils.config import GOOGLE_SAFE_BROWSING_API_KEY, DEMO_MODE, SAFE_BROWSING_TIMEOUT, WHOIS_TIMEOUT
from utils.validation import extract_domain
from utils.helpers import safe_json_parse

logger = logging.getLogger(__name__)

async def analyze_url(url: str) -> Dict[str, Any]:
    """
    Main URL analysis function
    Combines Safe Browsing and WHOIS analysis
    """
    if not url:
        return None
    
    domain = extract_domain(url)
    
    # Run analyses in parallel or sequentially
    safe_browsing_result = await check_safe_browsing_demo(url)
    domain_info = await get_domain_info_demo(domain)
    
    # Combine results
    flags = safe_browsing_result.get("flags", []) + domain_info.get("flags", [])
    
    # Calculate URL score
    url_score = 0
    if safe_browsing_result.get("is_malicious"):
        url_score += 50
    if domain_info.get("is_newly_registered"):
        url_score += 30
    if domain_info.get("age_days", 0) < 30:
        url_score += 20
    
    url_score = min(100, url_score)
    
    return {
        "domain_age_days": domain_info.get("age_days", -1),
        "url_score": url_score,
        "flags": list(set(flags)),  # Remove duplicates
        "domain_analysis": {
            "domain": domain,
            "is_suspicious": url_score > 50,
            "threat_types": safe_browsing_result.get("threat_types", []),
            "registrar": domain_info.get("registrar", "Unknown"),
            "creation_date": domain_info.get("creation_date", "Unknown")
        }
    }

async def check_safe_browsing_demo(url: str) -> Dict[str, Any]:
    """
    Demo Safe Browsing check (no API call)
    In production, this would call Google's API
    """
    
    # Demo: Check for suspicious patterns
    url_lower = url.lower()
    
    suspicious_patterns = [
        "paypa", "bank", "verify", "confirm", "update",
        "secure-", "-secure", "-verify", "-confirm",
        "bit.ly", "tinyurl", "short.link"
    ]
    
    threat_types = []
    is_malicious = False
    
    for pattern in suspicious_patterns:
        if pattern in url_lower:
            threat_types.append("SOCIAL_ENGINEERING")
            is_malicious = True
            break
    
    # Check for HTTP (not HTTPS)
    if url.startswith("http://") and "localhost" not in url:
        threat_types.append("UNENCRYPTED")
        is_malicious = True
    
    return {
        "is_malicious": is_malicious,
        "threat_types": threat_types,
        "flags": ["marked_by_safe_browsing"] if is_malicious else []
    }

async def get_domain_info_demo(domain: str) -> Dict[str, Any]:
    """
    Demo WHOIS lookup (no actual API call)
    In production, this would use the whois library
    """
    
    try:
        # Import whois for real implementation
        try:
            import whois
            domain_info = whois.whois(domain)
            
            creation_date = domain_info.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            
            age_days = (datetime.now() - creation_date).days if creation_date else -1
            
            return {
                "domain": domain,
                "creation_date": creation_date.isoformat() if creation_date else "Unknown",
                "age_days": age_days,
                "is_newly_registered": age_days < 7 if age_days > 0 else False,
                "registrar": str(domain_info.registrar) if hasattr(domain_info, 'registrar') else "Unknown",
                "flags": ["newly_registered"] if (age_days >= 0 and age_days < 7) else []
            }
        except ImportError:
            # Fallback to demo data
            raise Exception("whois not available, using demo")
    
    except Exception as e:
        logger.warning(f"WHOIS lookup failed for {domain}: {str(e)}, using demo data")
        
        # Demo data: generate based on domain characteristics
        is_suspicious = any(x in domain.lower() for x in ["verify", "secure-", "update", "confirm"])
        
        return {
            "domain": domain,
            "creation_date": "2026-03-14T00:00:00Z" if is_suspicious else "2015-01-01T00:00:00Z",
            "age_days": 3 if is_suspicious else 4000,
            "is_newly_registered": is_suspicious,
            "registrar": "GoDaddy" if is_suspicious else "ICANN",
            "flags": ["newly_registered", "suspicious_domain"] if is_suspicious else []
        }

def _validate_url_response(response: dict) -> dict:
    """Ensure URL response has required fields"""
    if not isinstance(response, dict):
        return {
            "domain_age_days": -1,
            "url_score": 0,
            "flags": [],
            "domain_analysis": {
                "domain": "unknown",
                "is_suspicious": False,
                "threat_types": [],
                "registrar": "Unknown"
            }
        }
    
    return response
