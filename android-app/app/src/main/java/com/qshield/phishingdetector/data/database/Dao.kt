package com.qshield.phishingdetector.data.database

import androidx.room.*
import com.qshield.phishingdetector.data.model.AnalyzedMessage
import com.qshield.phishingdetector.data.model.Statistics
import kotlinx.coroutines.flow.Flow

@Dao
interface MessageDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: AnalyzedMessage): Long
    
    @Update
    suspend fun updateMessage(message: AnalyzedMessage)
    
    @Delete
    suspend fun deleteMessage(message: AnalyzedMessage)
    
    @Query("SELECT * FROM analyzed_messages ORDER BY timestamp DESC")
    fun getAllMessages(): Flow<List<AnalyzedMessage>>
    
    @Query("SELECT * FROM analyzed_messages WHERE analyzed = 1 ORDER BY timestamp DESC")
    fun getAnalyzedMessages(): Flow<List<AnalyzedMessage>>
    
    @Query("SELECT * FROM analyzed_messages WHERE riskLevel = 'RED' ORDER BY timestamp DESC")
    fun getHighRiskMessages(): Flow<List<AnalyzedMessage>>
    
    @Query("SELECT * FROM analyzed_messages WHERE riskLevel = 'ORANGE' ORDER BY timestamp DESC")
    fun getMediumRiskMessages(): Flow<List<AnalyzedMessage>>
    
    @Query("SELECT * FROM analyzed_messages WHERE riskLevel = 'GREEN' ORDER BY timestamp DESC")
    fun getSafeMessages(): Flow<List<AnalyzedMessage>>
    
    @Query("SELECT * FROM analyzed_messages WHERE id = :id LIMIT 1")
    suspend fun getMessageById(id: Long): AnalyzedMessage?
    
    @Query("SELECT COUNT(*) FROM analyzed_messages")
    fun getTotalCount(): Flow<Int>
    
    @Query("SELECT COUNT(*) FROM analyzed_messages WHERE riskLevel = 'RED'")
    fun getHighRiskCount(): Flow<Int>
    
    @Query("SELECT COUNT(*) FROM analyzed_messages WHERE riskLevel = 'ORANGE'")
    fun getMediumRiskCount(): Flow<Int>
    
    @Query("SELECT COUNT(*) FROM analyzed_messages WHERE riskLevel = 'GREEN'")
    fun getSafeCount(): Flow<Int>
    
    @Query("SELECT AVG(riskScore) FROM analyzed_messages")
    fun getAverageRiskScore(): Flow<Float>
    
    @Query("DELETE FROM analyzed_messages")
    suspend fun deleteAllMessages()
}

@Dao
interface StatisticsDao {
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStatistics(stats: Statistics)
    
    @Update
    suspend fun updateStatistics(stats: Statistics)
    
    @Query("SELECT * FROM statistics WHERE id = 1 LIMIT 1")
    fun getStatistics(): Flow<Statistics?>
}
