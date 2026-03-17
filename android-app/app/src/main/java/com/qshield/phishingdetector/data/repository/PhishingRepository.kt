package com.qshield.phishingdetector.data.repository

import com.qshield.phishingdetector.data.api.PhishingDetectorApi
import com.qshield.phishingdetector.data.database.MessageDao
import com.qshield.phishingdetector.data.database.StatisticsDao
import com.qshield.phishingdetector.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class PhishingRepository(
    private val api: PhishingDetectorApi,
    private val messageDao: MessageDao,
    private val statisticsDao: StatisticsDao
) {
    
    // ============= Health Check =============
    suspend fun checkHealth(): Result<HealthResponse> = try {
        Result.success(api.checkHealth())
    } catch (e: Exception) {
        Result.failure(e)
    }
    
    // ============= Analysis =============
    suspend fun analyzeMessage(
        text: String,
        source: String = "app"
    ): Result<AnalysisResponse> = try {
        val request = AnalysisRequest(
            message = text,
            messageType = when (source.lowercase()) {
                "email", "gmail" -> "email"
                "sms" -> "sms"
                "chat", "teams", "slack" -> "chat"
                else -> "email"
            }
        )
        Result.success(api.analyzeMessage(request))
    } catch (e: Exception) {
        Result.failure(e)
    }
    
    // ============= Message Management =============
    suspend fun saveAnalyizedMessage(
        response: AnalysisResponse,
        originalText: String,
        source: String
    ) {
        val message = AnalyzedMessage(
            source = source,
            messageText = originalText,
            riskScore = response.finalRiskScore,
            riskLevel = response.riskLevel.uppercase(),
            explanation = response.explanation,
            allFlags = response.allFlags.joinToString(","),
            credentialHarvestingJson = response.credentialHarvesting?.toString(),
            anomalyDetectionJson = response.anomalyDetection?.toString(),
            attackPatternJson = response.attackPattern?.toString(),
            analyzed = true,
            analyzedAt = System.currentTimeMillis()
        )
        messageDao.insertMessage(message)
        updateStatistics()
    }
    
    fun getAllMessages(): Flow<List<AnalyzedMessage>> =
        messageDao.getAllMessages()
    
    fun getAnalyzedMessages(): Flow<List<AnalyzedMessage>> =
        messageDao.getAnalyzedMessages()
    
    fun getHighRiskMessages(): Flow<List<AnalyzedMessage>> =
        messageDao.getHighRiskMessages()
    
    fun getMediumRiskMessages(): Flow<List<AnalyzedMessage>> =
        messageDao.getMediumRiskMessages()
    
    fun getSafeMessages(): Flow<List<AnalyzedMessage>> =
        messageDao.getSafeMessages()
    
    suspend fun getMessageById(id: Long): AnalyzedMessage? =
        messageDao.getMessageById(id)
    
    suspend fun deleteMessage(message: AnalyzedMessage) {
        messageDao.deleteMessage(message)
        updateStatistics()
    }
    
    suspend fun deleteAllMessages() {
        messageDao.deleteAllMessages()
        statisticsDao.updateStatistics(Statistics())
    }
    
    // ============= Statistics =============
    private suspend fun updateStatistics() {
        val total = messageDao.getTotalCount().replayCache.firstOrNull() ?: 0
        val highRisk = messageDao.getHighRiskCount().replayCache.firstOrNull() ?: 0
        val mediumRisk = messageDao.getMediumRiskCount().replayCache.firstOrNull() ?: 0
        val safe = messageDao.getSafeCount().replayCache.firstOrNull() ?: 0
        val avgScore = messageDao.getAverageRiskScore().replayCache.firstOrNull() ?: 0f
        
        val stats = Statistics(
            totalAnalyzed = total,
            highRiskCount = highRisk,
            mediumRiskCount = mediumRisk,
            safeCount = safe,
            averageRiskScore = avgScore,
            lastUpdated = System.currentTimeMillis()
        )
        statisticsDao.updateStatistics(stats)
    }
    
    fun getStatistics(): Flow<Statistics> =
        statisticsDao.getStatistics().map { it ?: Statistics() }
    
    fun getDashboardStats(): Flow<DashboardUiState> {
        return messageDao.getTotalCount().map { total ->
            val highRisk = messageDao.getHighRiskCount().replayCache.firstOrNull() ?: 0
            val mediumRisk = messageDao.getMediumRiskCount().replayCache.firstOrNull() ?: 0
            val safe = messageDao.getSafeCount().replayCache.firstOrNull() ?: 0
            val avgScore = messageDao.getAverageRiskScore().replayCache.firstOrNull() ?: 0f
            
            DashboardUiState(
                totalNotifications = total,
                highRiskCount = highRisk,
                mediumRiskCount = mediumRisk,
                safeCount = safe,
                averageRiskScore = avgScore,
                analysisRate = if (total > 0) (highRisk + mediumRisk + safe) / total * 100f else 0f
            )
        }
    }
}

// Result wrapper
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error<T>(val exception: Throwable) : Result<T>()
    
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Error -> null
    }
    
    fun exceptionOrNull(): Throwable? = when (this) {
        is Success -> null
        is Error -> exception
    }
}

fun <T> Result<T>.mapSuccess(transform: (T) -> T): Result<T> = when (this) {
    is Result.Success -> Result.Success(transform(data))
    is Result.Error -> this
}
