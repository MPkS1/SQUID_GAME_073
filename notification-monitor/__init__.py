"""
QShield AI - Notification Monitor Package
"""

from .notification_listener import (
    NotificationDatabase,
    NotificationData,
    PhishingAnalyzer,
    NotificationMonitor,
    RiskSummary
)

from .windows_listener import (
    WindowsNotificationListener,
    EmailNotificationListener,
    ChatNotificationListener,
    FullSystemNotificationListener
)

__version__ = "1.0.0"
__author__ = "QShield AI Team"

__all__ = [
    "NotificationDatabase",
    "NotificationData",
    "PhishingAnalyzer",
    "NotificationMonitor",
    "RiskSummary",
    "WindowsNotificationListener",
    "EmailNotificationListener",
    "ChatNotificationListener",
    "FullSystemNotificationListener"
]
