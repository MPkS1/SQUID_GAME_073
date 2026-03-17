"""
QShield AI - Notification Phishing Detection Monitor
Real-time notification analysis and risk scoring system
"""

import sqlite3
import json
import os
import asyncio
import aiohttp
import logging
from datetime import datetime
from typing import Optional, Dict, List
from dataclasses import dataclass, asdict
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s',
    handlers=[
        logging.FileHandler('notification_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============= DATA MODELS =============

@dataclass
class NotificationData:
    """Stores notification information"""
    id: Optional[int] = None
    timestamp: str = ""
    source: str = ""  # App name (Windows, Gmail, Teams, etc)
    text: str = ""  # Notification content
    risk_score: Optional[int] = None  # 0-100
    risk_level: str = "UNKNOWN"  # RED, ORANGE, GREEN
    analysis_details: str = ""  # Full analysis JSON
    flags: str = ""  # Comma-separated flags
    is_analyzed: bool = False
    analysis_timestamp: Optional[str] = None

@dataclass
class RiskSummary:
    """Summary of risk analysis"""
    final_risk_score: int
    risk_level: str
    explanation: str
    all_flags: List[str]
    credential_harvesting: Optional[Dict] = None
    anomaly_detection: Optional[Dict] = None
    attack_pattern: Optional[Dict] = None


# ============= DATABASE MANAGER =============

class NotificationDatabase:
    """Manages SQLite database for storing notifications"""
    
    def __init__(self, db_path: str = "notifications.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database"""
        os.makedirs(os.path.dirname(self.db_path) or ".", exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Main notifications table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    source TEXT NOT NULL,
                    text TEXT NOT NULL,
                    risk_score INTEGER,
                    risk_level TEXT DEFAULT 'UNKNOWN',
                    is_analyzed BOOLEAN DEFAULT 0,
                    analysis_timestamp TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Analysis details table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS analysis_details (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    notification_id INTEGER UNIQUE NOT NULL,
                    explanation TEXT,
                    flags TEXT,
                    credential_harvesting TEXT,
                    anomaly_detection TEXT,
                    attack_pattern TEXT,
                    threat_intelligence TEXT,
                    all_analysis_data TEXT,
                    FOREIGN KEY (notification_id) REFERENCES notifications(id)
                )
            """)
            
            # Statistics/Learning table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS statistics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    total_analyzed INTEGER DEFAULT 0,
                    high_risk_count INTEGER DEFAULT 0,
                    medium_risk_count INTEGER DEFAULT 0,
                    safe_count INTEGER DEFAULT 0,
                    average_risk_score REAL DEFAULT 0,
                    top_threat_type TEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
            logger.info("✅ Database initialized successfully")
    
    def save_notification(self, notification: NotificationData) -> int:
        """Save notification to database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO notifications 
                (timestamp, source, text, risk_score, risk_level, is_analyzed, analysis_timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                notification.timestamp,
                notification.source,
                notification.text,
                notification.risk_score,
                notification.risk_level,
                notification.is_analyzed,
                notification.analysis_timestamp
            ))
            conn.commit()
            return cursor.lastrowid
    
    def save_analysis(self, notification_id: int, analysis: RiskSummary, full_response: Dict):
        """Save analysis details"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO analysis_details 
                (notification_id, explanation, flags, credential_harvesting, anomaly_detection, 
                 attack_pattern, threat_intelligence, all_analysis_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                notification_id,
                analysis.explanation,
                ",".join(analysis.all_flags),
                json.dumps(analysis.credential_harvesting or {}),
                json.dumps(analysis.anomaly_detection or {}),
                json.dumps(analysis.attack_pattern or {}),
                json.dumps(full_response.get("threat_intelligence", {})),
                json.dumps(full_response)
            ))
            
            # Update notification with analysis
            cursor.execute("""
                UPDATE notifications 
                SET risk_score = ?, risk_level = ?, is_analyzed = 1, analysis_timestamp = ?
                WHERE id = ?
            """, (
                analysis.final_risk_score,
                analysis.risk_level,
                datetime.now().isoformat(),
                notification_id
            ))
            
            conn.commit()
            logger.info(f"💾 Analysis saved for notification {notification_id}")
    
    def get_statistics(self) -> Dict:
        """Get overall statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM notifications")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM notifications WHERE risk_level = 'RED'")
            high_risk = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM notifications WHERE risk_level = 'ORANGE'")
            medium_risk = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM notifications WHERE risk_level = 'GREEN'")
            safe = cursor.fetchone()[0]
            
            cursor.execute("SELECT AVG(risk_score) FROM notifications WHERE risk_score IS NOT NULL")
            avg_score = cursor.fetchone()[0] or 0
            
            return {
                "total_notifications": total,
                "high_risk": high_risk,
                "medium_risk": medium_risk,
                "safe": safe,
                "average_risk_score": round(avg_score, 2),
                "analysis_rate": f"{round((high_risk + medium_risk + safe) / max(total, 1) * 100, 1)}%"
            }
    
    def get_recent_notifications(self, limit: int = 10) -> List[Dict]:
        """Get recent notifications"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT n.*, 
                       a.explanation, a.flags
                FROM notifications n
                LEFT JOIN analysis_details a ON n.id = a.notification_id
                ORDER BY n.created_at DESC
                LIMIT ?
            """, (limit,))
            
            return [dict(row) for row in cursor.fetchall()]


# ============= API ANALYZER =============

class PhishingAnalyzer:
    """Analyzes notifications using backend API"""
    
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.timeout = aiohttp.ClientTimeout(total=10)
    
    async def analyze(self, text: str, source: str = "system") -> Optional[RiskSummary]:
        """Analyze notification text using backend"""
        
        # Determine message type based on source
        message_type_map = {
            "gmail": "email",
            "outlook": "email",
            "teams": "chat",
            "slack": "chat",
            "sms": "sms",
            "windows": "email",
            "system": "email"
        }
        
        message_type = message_type_map.get(source.lower(), "email")
        
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                payload = {
                    "message": text,
                    "message_type": message_type,
                    "url": None
                }
                
                async with session.post(
                    f"{self.backend_url}/analyze",
                    json=payload
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Determine risk level
                        score = data.get("final_risk_score", 0)
                        if score >= 70:
                            risk_level = "RED"
                        elif score >= 40:
                            risk_level = "ORANGE"
                        else:
                            risk_level = "GREEN"
                        
                        analysis = RiskSummary(
                            final_risk_score=score,
                            risk_level=risk_level,
                            explanation=data.get("explanation", ""),
                            all_flags=data.get("all_flags", []),
                            credential_harvesting=data.get("credential_harvesting"),
                            anomaly_detection=data.get("anomaly_detection"),
                            attack_pattern=data.get("attack_pattern")
                        )
                        
                        logger.info(f"✓ Analysis complete: {score}/100 ({risk_level})")
                        return analysis, data
                    else:
                        logger.error(f"❌ Analysis failed: {response.status}")
                        return None, None
        
        except asyncio.TimeoutError:
            logger.error("⏱️ Backend request timeout")
            return None, None
        except Exception as e:
            logger.error(f"❌ Analysis error: {str(e)}")
            return None, None


# ============= NOTIFICATION MONITOR =============

class NotificationMonitor:
    """Main notification monitoring system"""
    
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.db = NotificationDatabase()
        self.analyzer = PhishingAnalyzer(backend_url)
        self.is_running = False
        self.analyzed_count = 0
    
    async def process_notification(self, source: str, text: str):
        """Process a single notification"""
        
        if len(text) < 5:
            logger.info("⏭️ Skipping notification: too short")
            return
        
        # Create notification record
        notification = NotificationData(
            timestamp=datetime.now().isoformat(),
            source=source,
            text=text,
            is_analyzed=False
        )
        
        # Save to database
        notif_id = self.db.save_notification(notification)
        logger.info(f"📌 Notification received from {source}: {text[:50]}...")
        
        # Analyze with backend
        analysis_result = await self.analyzer.analyze(text, source)
        
        if analysis_result and analysis_result[0]:
            analysis, full_response = analysis_result
            
            # Save analysis
            self.db.save_analysis(notif_id, analysis, full_response)
            
            # Log risk summary
            emoji_map = {"RED": "🔴", "ORANGE": "🟠", "GREEN": "🟢"}
            emoji = emoji_map.get(analysis.risk_level, "⚪")
            
            logger.info(f"{emoji} RISK ANALYSIS: {analysis.final_risk_score}/100 - {analysis.risk_level}")
            if analysis.all_flags:
                logger.info(f"   Flags: {', '.join(analysis.all_flags[:3])}")
            
            self.analyzed_count += 1
        else:
            logger.warning(f"⚠️ Could not analyze notification")
    
    def get_dashboard_data(self) -> Dict:
        """Get data for dashboard display"""
        stats = self.db.get_statistics()
        recent = self.db.get_recent_notifications(10)
        
        return {
            "statistics": stats,
            "recent_notifications": recent,
            "total_analyzed_this_session": self.analyzed_count
        }
    
    def print_dashboard(self):
        """Print dashboard to console"""
        data = self.get_dashboard_data()
        stats = data["statistics"]
        
        print("\n" + "="*60)
        print("📊 QSHIELD AI - NOTIFICATION MONITOR DASHBOARD")
        print("="*60)
        print(f"📌 Total Notifications: {stats['total_notifications']}")
        print(f"🔴 High Risk (70+):    {stats['high_risk']}")
        print(f"🟠 Medium Risk (40-69):{stats['medium_risk']}")
        print(f"🟢 Safe (<40):         {stats['safe']}")
        print(f"📊 Average Risk Score: {stats['average_risk_score']}/100")
        print(f"✅ Analysis Rate:      {stats['analysis_rate']}")
        print("="*60 + "\n")


# ============= TEST MODE (For Demo) =============

async def test_with_sample_notifications():
    """Test the system with sample notifications"""
    
    print("\n🧪 Starting test mode with sample notifications...\n")
    
    monitor = NotificationMonitor()
    
    # Sample notifications to test
    samples = [
        ("Gmail", "Your Amazon account has been suspended. Click here to verify: amazon-secure-verify.net"),
        ("Windows", "PayPal: Confirm your account information immediately or it will be locked"),
        ("Teams", "System update available. Please click to update your Windows 10"),
        ("Slack", "Hi Bob, can you wire $50,000 to our vendor? ASAP!"),
        ("System", "Your LinkedIn profile has suspicious activity. Reset password now"),
        ("Gmail", "Congratulations! You won a free iPhone. Claim your prize here"),
        ("Windows", "Your credit card payment failed. Update payment method to continue"),
        ("Gmail", "Google Security: Verify your identity with your password")
    ]
    
    # Analyze each sample
    for source, text in samples:
        await monitor.process_notification(source, text)
        await asyncio.sleep(1)  # Small delay between requests
    
    # Show results
    monitor.print_dashboard()
    
    # Show recent notifications with analysis
    recent = monitor.db.get_recent_notifications(5)
    print("\n📋 Recent Analyzed Notifications:")
    print("-"*60)
    for notif in recent:
        if notif['risk_score'] is not None:
            emoji = "🔴" if notif['risk_level'] == "RED" else "🟠" if notif['risk_level'] == "ORANGE" else "🟢"
            print(f"{emoji} [{notif['source']}] {notif['risk_score']}/100")
            print(f"   {notif['text'][:60]}...")
            if notif['explanation']:
                print(f"   Details: {notif['explanation'][:80]}...")
            print()


# ============= RUN MONITOR =============

if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║     QShield AI - Notification Phishing Detection Monitor    ║
    ║              Real-time Risk Analysis System                 ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    # Run test mode
    asyncio.run(test_with_sample_notifications())
