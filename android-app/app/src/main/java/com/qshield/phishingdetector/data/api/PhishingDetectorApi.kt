package com.qshield.phishingdetector.data.api

import com.qshield.phishingdetector.data.model.AnalysisRequest
import com.qshield.phishingdetector.data.model.AnalysisResponse
import com.qshield.phishingdetector.data.model.HealthResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface PhishingDetectorApi {
    
    @GET("/health")
    suspend fun checkHealth(): HealthResponse
    
    @POST("/analyze")
    suspend fun analyzeMessage(@Body request: AnalysisRequest): AnalysisResponse
    
    @POST("/report-phishing")
    suspend fun reportPhishing(@Body message: String): Map<String, String>
}
