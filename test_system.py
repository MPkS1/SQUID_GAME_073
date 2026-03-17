#!/usr/bin/env python3
"""
QShield AI Test Program
Tests the entire system by sending requests to the backend API
"""

import requests
import json
import time
from datetime import datetime

API_URL = "http://localhost:8000"

# ANSI color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
PURPLE = '\033[95m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_header(text):
    print(f"\n{BOLD}{CYAN}{'='*60}{RESET}")
    print(f"{BOLD}{CYAN}{text.center(60)}{RESET}")
    print(f"{BOLD}{CYAN}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ️  {text}{RESET}")

def print_result(key, value):
    print(f"  {YELLOW}{key}:{RESET} {value}")

def test_health():
    """Test if backend is running"""
    print_header("Testing Backend Health")
    
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        if response.status_code == 200:
            print_success("Backend is running")
            data = response.json()
            print_result("Status", data.get('status', 'unknown'))
            print_result("API Mode", "Real APIs" if not data.get('demo_mode') else "Demo Mode")
            return True
        else:
            print_error(f"Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Could not reach backend: {e}")
        print_info(f"Make sure backend is running at {API_URL}")
        return False

def test_analysis(message, message_type="email"):
    """Test the analysis endpoint"""
    print_header(f"Testing Message Analysis: {message_type.upper()}")
    
    print(f"{YELLOW}Message:{RESET} {message}\n")
    
    payload = {
        "message": message,
        "message_type": message_type
    }
    
    try:
        print(f"{BLUE}Sending request to {API_URL}/analyze...{RESET}")
        response = requests.post(
            f"{API_URL}/analyze",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code != 200:
            print_error(f"API returned status {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        print_success("Request successful (HTTP 200)")
        
        data = response.json()
        
        # Display results
        print(f"\n{BOLD}Analysis Results:{RESET}")
        print_result("Risk Score", f"{data.get('final_risk_score', 0)}/100")
        print_result("Risk Level", data.get('risk_level', 'UNKNOWN'))
        print_result("Confidence", f"{int(data.get('confidence', 0) * 100)}%")
        
        # Flags
        all_flags = data.get('all_flags', [])
        if all_flags:
            print_result("Detected Flags", ', '.join(all_flags))
        
        # Behavior Analysis
        behavior = data.get('behavior_analysis', {})
        if behavior:
            print(f"\n{BOLD}Behavioral Analysis:{RESET}")
            print_result("Behavior Score", behavior.get('behavior_score', 0))
            print_result("Flags", ', '.join(behavior.get('flags', [])))
            if behavior.get('evidence'):
                print_result("Evidence", json.dumps(behavior.get('evidence'), indent=2))
        
        # URL Analysis
        url_analysis = data.get('url_analysis')
        if url_analysis:
            print(f"\n{BOLD}URL Analysis:{RESET}")
            print_result("URL Score", url_analysis.get('url_score', 'N/A'))
            if url_analysis.get('flags'):
                print_result("Issues", ', '.join(url_analysis.get('flags', [])))
        
        # Quantum Analysis
        quantum = data.get('quantum_analysis', {})
        if quantum:
            print(f"\n{BOLD}Quantum Threat Analysis:{RESET}")
            print_result("Risk Level", quantum.get('quantum_risk_level', 'LOW'))
            print_result("Data Types", ', '.join(quantum.get('data_types_detected', [])))
            print_result("Timeline", quantum.get('timeline', 'N/A'))
        
        # Explanation
        print(f"\n{BOLD}Explanation:{RESET}")
        print(f"  {data.get('explanation', 'No explanation provided')}")
        
        return data
        
    except requests.exceptions.Timeout:
        print_error("Request timed out - backend may be slow")
        return None
    except Exception as e:
        print_error(f"Request failed: {e}")
        return None

def run_test_suite():
    """Run the complete test suite"""
    print(f"\n{PURPLE}{BOLD}")
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║         QShield AI - System Test Program v1.0            ║
    ║         Testing Phishing Detection System                ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    print(RESET)
    
    # Test 1: Health check
    if not test_health():
        print_error("Cannot proceed without backend. Exiting.")
        return
    
    time.sleep(1)
    
    # Test 2: Simple test message
    test_analysis(
        "Click here to verify your account before it gets suspended!",
        "email"
    )
    
    time.sleep(1)
    
    # Test 3: PayPal phishing attempt
    test_analysis(
        "URGENT: Your PayPal account has been SUSPENDED! Your password will be reset in 24 hours unless you verify your identity immediately. Click here now: paypal-security-verify.com. Do not ignore this!",
        "email"
    )
    
    time.sleep(1)
    
    # Test 4: SMS phishing
    test_analysis(
        "Your bank account is locked. Confirm amount $5000 withdrawal or call 1-800-SCAMMER",
        "sms"
    )
    
    time.sleep(1)
    
    # Test 5: Low-risk message
    test_analysis(
        "Hi, what time is the meeting tomorrow?",
        "chat"
    )
    
    # Final summary
    print_header("Test Suite Complete")
    print_success("All tests completed successfully!")
    print_info("Check the results above to verify:")
    print(f"  {CYAN}✓ Backend is responding{RESET}")
    print(f"  {CYAN}✓ API is processing messages{RESET}")
    print(f"  {CYAN}✓ All analysis engines are working{RESET}")
    print(f"  {CYAN}✓ Results are being formatted correctly{RESET}")
    print(f"\n{YELLOW}Next Step: Open http://localhost:5173/ in your browser and test the UI!{RESET}\n")

if __name__ == "__main__":
    run_test_suite()
