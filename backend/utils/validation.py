"""
Input validation utilities
"""
from utils.config import MAX_MESSAGE_LENGTH, MIN_MESSAGE_LENGTH, MAX_URL_LENGTH
from urllib.parse import urlparse
import re

def validate_message(message: str) -> tuple[bool, str]:
    """
    Validate message length and content
    Returns: (is_valid, error_message)
    """
    if not message or not isinstance(message, str):
        return False, "Message must be a non-empty string"
    
    if len(message) < MIN_MESSAGE_LENGTH:
        return False, f"Message too short (minimum {MIN_MESSAGE_LENGTH} characters)"
    
    if len(message) > MAX_MESSAGE_LENGTH:
        return False, f"Message too long (maximum {MAX_MESSAGE_LENGTH} characters)"
    
    return True, ""

def validate_url(url: str) -> tuple[bool, str]:
    """
    Validate URL format
    Returns: (is_valid, error_message)
    """
    if not url or not isinstance(url, str):
        return False, "URL must be a non-empty string"
    
    if len(url) > MAX_URL_LENGTH:
        return False, f"URL too long (maximum {MAX_URL_LENGTH} characters)"
    
    try:
        result = urlparse(url)
        if not all([result.scheme, result.netloc]):
            return False, "URL must include scheme (http/https) and domain"
        
        if result.scheme not in ["http", "https"]:
            return False, "Only http and https schemes are allowed"
        
        return True, ""
    except Exception as e:
        return False, f"Invalid URL format: {str(e)}"

def validate_message_type(message_type: str) -> tuple[bool, str]:
    """
    Validate message type
    Returns: (is_valid, error_message)
    """
    valid_types = ["email", "sms", "chat", "url"]
    
    if not message_type or not isinstance(message_type, str):
        return False, "Message type must be a non-empty string"
    
    if message_type.lower() not in valid_types:
        return False, f"Invalid message type. Must be one of: {', '.join(valid_types)}"
    
    return True, ""

def extract_domain(url: str) -> str:
    """Extract domain from URL"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        # Remove www. prefix if present
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except:
        return url
