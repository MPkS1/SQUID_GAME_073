"""
QShield AI Notification Monitor - Quick Start Script
Simplifies setup and running the entire system
"""

import sys
import os
import platform
import subprocess
import asyncio
import time
from pathlib import Path

# Colors for output
GREEN = '\033[92m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RED = '\033[91m'
BOLD = '\033[1m'
RESET = '\033[0m'


def print_header():
    """Print system header"""
    print(f"""
    {BOLD}{BLUE}╔════════════════════════════════════════════════════════════╗{RESET}
    {BOLD}{BLUE}║     QShield AI - Notification Phishing Detection Monitor    ║{RESET}
    {BOLD}{BLUE}╚════════════════════════════════════════════════════════════╝{RESET}
    """)


def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"{RED}❌ Python 3.8+ required{RESET}")
        sys.exit(1)
    print(f"{GREEN}✅ Python {version.major}.{version.minor}.{version.micro}{RESET}")


def check_backend():
    """Check if backend is running"""
    import requests
    try:
        response = requests.get("http://localhost:8000/health", timeout=2)
        if response.status_code == 200:
            print(f"{GREEN}✅ Backend running on http://localhost:8000{RESET}")
            return True
    except:
        pass
    
    print(f"{YELLOW}⚠️  Backend not detected on http://localhost:8000{RESET}")
    print(f"   {BOLD}Start backend with:{RESET}")
    print(f"   cd backend && python main.py")
    return False


def install_dependencies():
    """Install required packages"""
    print(f"\n{BOLD}📦 Installing dependencies...{RESET}")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print(f"{YELLOW}⚠️  requirements.txt not found{RESET}")
        return False
    
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-q", "-r", str(requirements_file)],
            cwd=str(Path(__file__).parent)
        )
        print(f"{GREEN}✅ Dependencies installed{RESET}")
        return True
    except subprocess.CalledProcessError:
        print(f"{RED}❌ Failed to install dependencies{RESET}")
        return False


def run_test_mode():
    """Run system test with sample notifications"""
    print(f"\n{BOLD}🧪 Running test mode with sample notifications...{RESET}\n")
    
    try:
        from notification_listener import test_with_sample_notifications
        asyncio.run(test_with_sample_notifications())
        print(f"\n{GREEN}✅ Test completed successfully{RESET}")
        return True
    except Exception as e:
        print(f"{RED}❌ Test failed: {str(e)}{RESET}")
        return False


def run_dashboard():
    """Run web dashboard"""
    print(f"\n{BOLD}🚀 Starting dashboard...{RESET}")
    print(f"{YELLOW}⏳ Wait for startup message, then visit: http://localhost:5000{RESET}\n")
    
    try:
        from dashboard import app
        app.run(debug=False, port=5000, host='0.0.0.0')
    except KeyboardInterrupt:
        print(f"\n{YELLOW}⏹️  Dashboard stopped{RESET}")
    except Exception as e:
        print(f"{RED}❌ Dashboard error: {str(e)}{RESET}")


def run_monitor():
    """Run monitor with live listening"""
    print(f"\n{BOLD}🎧 Starting notification listener...{RESET}")
    print(f"{YELLOW}⏳ Monitoring for system notifications...{RESET}\n")
    
    try:
        from notification_listener import NotificationMonitor
        
        async def monitor():
            mon = NotificationMonitor()
            
            # Example: monitor for 60 seconds
            print(f"{BLUE}(Running for 60 seconds, Ctrl+C to stop){RESET}\n")
            
            # In real use, the Windows listener would capture notifications
            # For now, show how to manually inject test notifications
            print(f"{YELLOW}To test, use the dashboard and inject notifications:{RESET}")
            print(f"  http://localhost:5000")
            
            try:
                await asyncio.sleep(60)
            except KeyboardInterrupt:
                pass
            
            mon.print_dashboard()
        
        asyncio.run(monitor())
    except KeyboardInterrupt:
        print(f"\n{YELLOW}⏹️  Monitor stopped{RESET}")
    except Exception as e:
        print(f"{RED}❌ Monitor error: {str(e)}{RESET}")


def show_menu():
    """Show interactive menu"""
    while True:
        print(f"\n{BOLD}═══════════════════════════════════════{RESET}")
        print(f"What would you like to do?\n")
        print(f"{BLUE}1{RESET} - Run test mode (analyze 8 sample notifications)")
        print(f"{BLUE}2{RESET} - Start web dashboard (http://localhost:5000)")
        print(f"{BLUE}3{RESET} - Start notification listener")
        print(f"{BLUE}4{RESET} - Check system status")
        print(f"{BLUE}5{RESET} - View documentation")
        print(f"{BLUE}6{RESET} - Exit")
        print(f"{BOLD}═══════════════════════════════════════{RESET}")
        
        choice = input(f"\n{BOLD}Enter choice (1-6):{RESET} ").strip()
        
        if choice == "1":
            run_test_mode()
        elif choice == "2":
            if not check_backend():
                print(f"\n{YELLOW}⚠️  Continuing anyway (dashboard will warn if backend unavailable){RESET}")
            run_dashboard()
        elif choice == "3":
            if not check_backend():
                print(f"{RED}❌ Backend required to run listener{RESET}")
                continue
            run_monitor()
        elif choice == "4":
            print(f"\n{BOLD}System Status:{RESET}")
            print(f"  Python: {sys.version.split()[0]}")
            print(f"  Platform: {platform.platform()}")
            check_backend()
        elif choice == "5":
            try:
                with open(Path(__file__).parent / "README.md") as f:
                    print("\n" + f.read())
            except:
                print(f"{YELLOW}README.md not found{RESET}")
        elif choice == "6":
            print(f"\n{GREEN}👋 Goodbye!{RESET}\n")
            sys.exit(0)
        else:
            print(f"{RED}❌ Invalid choice{RESET}")


def main():
    """Main entry point"""
    print_header()
    
    # Check Python version
    check_python_version()
    
    # Check/install dependencies
    try:
        import flask
        import aiohttp
        print(f"{GREEN}✅ All dependencies installed{RESET}")
    except ImportError:
        print(f"{YELLOW}📦 Missing dependencies, installing...{RESET}")
        if not install_dependencies():
            sys.exit(1)
    
    # Check backend
    backend_ready = check_backend()
    
    # Show menu
    try:
        show_menu()
    except KeyboardInterrupt:
        print(f"\n{GREEN}👋 Goodbye!{RESET}\n")


if __name__ == "__main__":
    main()
