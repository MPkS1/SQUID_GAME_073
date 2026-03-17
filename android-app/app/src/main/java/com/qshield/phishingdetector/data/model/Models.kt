package com.qshield.phishingdetector.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName
import java.time.LocalDateTime

// ============= API Request Models =============

data class AnalysisRequest(
    @SerializedName("message")
    val message: String,
    
    @SerializedName("message_type")
    val messageType: String, // email, sms, chat, url
    
    @SerializedName("url")
    val url: String? = null
)

// ============= API Response Models =============

data class AnalysisResponse(
    @SerializedName("final_risk_score")
    val finalRiskScore: Int,
    
    @SerializedName("risk_level")
    val riskLevel: String, // HIGH_RISK, MEDIUM_RISK, LOW_RISK
    
    @SerializedName("explanation")
    val explanation: String,
    
    @SerializedName("confidence")
    val confidence: Float,
    
    @SerializedName("all_flags")
    val allFlags: List<String>,
    
    @SerializedName("tactics")
    val tactics: List<String>,
    
    @SerializedName("behavior_analysis")
    val behaviorAnalysis: BehaviorAnalysis?,
    
    @SerializedName("url_analysis")
    val urlAnalysis: UrlAnalysis?,
    
    @SerializedName("credential_harvesting")
    val credentialHarvesting: CredentialHarvesting?,
    
    @SerializedName("anomaly_detection")
    val anomalyDetection: AnomalyDetection?,
    
    @SerializedName("attack_pattern")
    val attackPattern: AttackPattern?,
    
    @SerializedName("threat_intelligence")
    val threatIntelligence: ThreatIntelligence?
)

data class BehaviorAnalysis(
    @SerializedName("behavior_score")
    val behaviorScore: Int,
    
    @SerializedName("flags")
    val flags: List<String>,
    
    @SerializedName("explanation")
    val explanation: String
)

data class UrlAnalysis(
    @SerializedName("url_score")
    val urlScore: Int,
    
    @SerializedName("flags")
    val flags: List<String>,
    
    @SerializedName("domain_analysis")
    val domainAnalysis: Map<String, Any>?
)

data class CredentialHarvesting(
    @SerializedName("credential_types_requested")
    val credentialTypesRequested: List<String>,
    
    @SerializedName("credential_risk_level")
    val credentialRiskLevel: String,
    
    @SerializedName("credential_score")
    val credentialScore: Int
)

data class AnomalyDetection(
    @SerializedName("anomalies_detected")
    val anomaliesDetected: List<String>,
    
    @SerializedName("anomaly_score")
    val anomalyScore: Int
)

data class AttackPattern(
    @SerializedName("attack_framework_detected")
    val attackFrameworkDetected: String,
    
    @SerializedName("framework_confidence_percent")
    val frameworkConfidencePercent: Int,
    
    @SerializedName("known_similar_attacks")
    val knownSimilarAttacks: Int
)

data class ThreatIntelligence(
    @SerializedName("total_threats_analyzed")
    val totalThreatsAnalyzed: Int,
    
    @SerializedName("average_risk_score")
    val averageRiskScore: Float,
    
    @SerializedName("top_threat_type")
    val topThreatType: String
)

data class HealthResponse(
    @SerializedName("status")
    val status: String,
    
    @SerializedName("timestamp")
    val timestamp: String,
    
    @SerializedName("demo_mode")
    val demoMode: Boolean
)

// ============= Database Models =============

@Entity(tableName = "analyzed_messages")
data class AnalyzedMessage(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    val timestamp: Long = System.currentTimeMillis(),
    
    val source: String, // Gmail, Teams, SMS, etc
    
    val messageText: String,
    
    val riskScore: Int,
    
    val riskLevel: String, // RED, ORANGE, GREEN
    
    val explanation: String,
    
    val allFlags: String, // Comma-separated
    
    val credentialHarvestingJson: String? = null,
    
    val anomalyDetectionJson: String? = null,
    
    val attackPatternJson: String? = null,
    
    val analyzed: Boolean = false,
    
    val analyzedAt: Long? = null
)

@Entity(tableName = "statistics")
data class Statistics(
    @PrimaryKey
    val id: Int = 1,
    
    val totalAnalyzed: Int = 0,
    
    val highRiskCount: Int = 0,
    
    val mediumRiskCount: Int = 0,
    
    val safeCount: Int = 0,
    
    val averageRiskScore: Float = 0f,
    
    val lastUpdated: Long = System.currentTimeMillis()
)

// ============= UI Models =============

data class RiskItemUiState(
    val id: Long,
    val source: String,
    val text: String,
    val riskScore: Int,
    val riskLevel: String,
    val timestamp: Long,
    val explanation: String,
    val flags: List<String>
)

data class DashboardUiState(
    val totalNotifications: Int = 0,
    val highRiskCount: Int = 0,
    val mediumRiskCount: Int = 0,
    val safeCount: Int = 0,
    val averageRiskScore: Float = 0f,
    val analysisRate: Float = 0f,
    val isLoading: Boolean = false,
    val error: String? = null
)

data class AnalysisDetailUiState(
    val riskScore: Int,
    val riskLevel: String,
    val explanation: String,
    val allFlags: List<String>,
    val credentialTypes: List<String>? = null,
    val anomalies: List<String>? = null,
    val attackPattern: String? = null
)
