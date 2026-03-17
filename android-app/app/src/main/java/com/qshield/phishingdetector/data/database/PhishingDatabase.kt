package com.qshield.phishingdetector.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.qshield.phishingdetector.data.model.AnalyzedMessage
import com.qshield.phishingdetector.data.model.Statistics

@Database(
    entities = [AnalyzedMessage::class, Statistics::class],
    version = 1,
    exportSchema = false
)
abstract class PhishingDatabase : RoomDatabase() {
    abstract fun messageDao(): MessageDao
    abstract fun statisticsDao(): StatisticsDao
    
    companion object {
        @Volatile
        private var instance: PhishingDatabase? = null
        
        fun getInstance(context: Context): PhishingDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    PhishingDatabase::class.java,
                    "phishing_detector_db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { instance = it }
            }
        }
    }
}
