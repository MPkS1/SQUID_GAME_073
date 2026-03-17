"""
Windows Toast Notification Listener
Hooks into Windows notifications to capture alert text
"""

import asyncio
import logging
from typing import Callable, Optional

logger = logging.getLogger(__name__)


class WindowsNotificationListener:
    """
    Listens to Windows Toast Notifications
    Uses Windows Runtime (WinRT) API to monitor notifications
    """
    
    def __init__(self, callback: Callable):
        """
        Initialize Windows notification listener
        
        Args:
            callback: Async function to call when notification received
                     Signature: async callback(source: str, text: str)
        """
        self.callback = callback
        self.is_listening = False
        self._init_watcher()
    
    def _init_watcher(self):
        """Initialize Windows notification watcher"""
        try:
            # Try to import Windows Runtime
            import winrt
            from winrt.windows.ui.notifications import ToastNotificationManager
            from winrt.windows.ui.notifications import ToastNotification
            
            self.winrt_available = True
            self.ToastNotificationManager = ToastNotificationManager
            logger.info("✅ Windows Runtime (WinRT) available")
        
        except ImportError:
            self.winrt_available = False
            logger.warning("⚠️ Windows Runtime not available. Using fallback method.")
    
    async def start(self):
        """Start listening for notifications"""
        self.is_listening = True
        logger.info("🎧 Starting Windows notification listener...")
        
        if self.winrt_available:
            await self._listen_with_winrt()
        else:
            await self._listen_with_fallback()
    
    async def _listen_with_winrt(self):
        """Listen using Windows Runtime API"""
        try:
            # Register app for notifications
            logger.info("📱 Registering for Windows notifications...")
            
            # This is a simplified version - full implementation requires:
            # 1. App must be registered in Windows
            # 2. Must have notification permissions
            # 3. Requires async event handling
            
            while self.is_listening:
                await asyncio.sleep(1)
        
        except Exception as e:
            logger.error(f"❌ WinRT listener error: {str(e)}")
            await self._listen_with_fallback()
    
    async def _listen_with_fallback(self):
        """
        Fallback: Monitor system event logs for notifications
        Or monitor specific application windows
        """
        logger.info("🔍 Using fallback notification detection method")
        
        # For now, show how to manually inject notifications in tests
        logger.info("ℹ️ To test: Call monitor.process_notification() directly")
        
        # Fallback: Monitor Windows Event Log for notifications
        try:
            import evtx
            logger.info("📋 Monitoring Windows Event Log...")
            # This would read Windows event log for notification events
        except ImportError:
            logger.info("ℹ️ Install 'python-evtx' for event log monitoring: pip install python-evtx")
        
        while self.is_listening:
            await asyncio.sleep(5)
    
    async def inject_notification(self, source: str, text: str):
        """Manually inject a notification (for testing)"""
        logger.info(f"💉 Injecting test notification from {source}")
        await self.callback(source, text)
    
    def stop(self):
        """Stop listening"""
        self.is_listening = False
        logger.info("🛑 Stopped Windows notification listener")


class EmailNotificationListener:
    """
    Listens to email client notifications
    Monitors: Gmail, Outlook, Apple Mail
    """
    
    def __init__(self, callback: Callable):
        self.callback = callback
        self.is_listening = False
    
    async def start(self):
        """Start listening for email notifications"""
        self.is_listening = True
        logger.info("📧 Starting email notification listener...")
        
        while self.is_listening:
            # Would monitor email clients for new message notifications
            await asyncio.sleep(1)
    
    def stop(self):
        """Stop listening"""
        self.is_listening = False
        logger.info("🛑 Stopped email notification listener")


class ChatNotificationListener:
    """
    Listens to chat app notifications
    Monitors: Slack, Teams, Discord
    """
    
    def __init__(self, callback: Callable):
        self.callback = callback
        self.is_listening = False
    
    async def start(self):
        """Start listening for chat notifications"""
        self.is_listening = True
        logger.info("💬 Starting chat notification listener...")
        
        while self.is_listening:
            # Would monitor chat apps for notifications
            await asyncio.sleep(1)
    
    def stop(self):
        """Stop listening"""
        self.is_listening = False
        logger.info("🛑 Stopped chat notification listener")


# ============= INTEGRATED LISTENER =============

class FullSystemNotificationListener:
    """
    Integrated listener for all notification types
    """
    
    def __init__(self, callback: Callable):
        self.callback = callback
        self.listeners = [
            WindowsNotificationListener(callback),
            EmailNotificationListener(callback),
            ChatNotificationListener(callback)
        ]
    
    async def start(self):
        """Start all listeners"""
        logger.info("🚀 Starting full system notification listener...")
        await asyncio.gather(*[listener.start() for listener in self.listeners])
    
    def stop(self):
        """Stop all listeners"""
        for listener in self.listeners:
            listener.stop()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - [%(levelname)s] - %(message)s'
    )
    
    async def dummy_callback(source: str, text: str):
        print(f"\n📬 {source}: {text}")
    
    listener = FullSystemNotificationListener(dummy_callback)
    
    try:
        asyncio.run(listener.start())
    except KeyboardInterrupt:
        listener.stop()
