package com.qshield.phishingdetector.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qshield.phishingdetector.data.model.AnalyzedMessage
import com.qshield.phishingdetector.data.model.DashboardUiState
import com.qshield.phishingdetector.data.repository.PhishingRepository
import com.qshield.phishingdetector.data.repository.Result
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DashboardViewModel(private val repository: PhishingRepository) : ViewModel() {
    
    // Dashboard state
    private val _dashboardUiState = MutableStateFlow(DashboardUiState())
    val dashboardUiState: StateFlow<DashboardUiState> = _dashboardUiState.asStateFlow()
    
    // Recent messages
    private val _recentMessages = MutableStateFlow<List<AnalyzedMessage>>(emptyList())
    val recentMessages: StateFlow<List<AnalyzedMessage>> = _recentMessages.asStateFlow()
    
    // High risk messages
    private val _highRiskMessages = MutableStateFlow<List<AnalyzedMessage>>(emptyList())
    val highRiskMessages: StateFlow<List<AnalyzedMessage>> = _highRiskMessages.asStateFlow()
    
    // Loading and error states
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    init {
        loadDashboardData()
    }
    
    private fun loadDashboardData() {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                
                launch {
                    repository.getDashboardStats().collect {
                        _dashboardUiState.value = it
                    }
                }
                
                launch {
                    repository.getAnalyzedMessages().collect {
                        _recentMessages.value = it.take(20)
                    }
                }
                
                launch {
                    repository.getHighRiskMessages().collect {
                        _highRiskMessages.value = it.take(10)
                    }
                }
                
                _isLoading.value = false
            } catch (e: Exception) {
                _errorMessage.value = e.message
                _isLoading.value = false
            }
        }
    }
    
    fun refreshData() {
        loadDashboardData()
    }
    
    fun deleteMessage(message: AnalyzedMessage) {
        viewModelScope.launch {
            repository.deleteMessage(message)
            loadDashboardData()
        }
    }
    
    fun clearAllMessages() {
        viewModelScope.launch {
            repository.deleteAllMessages()
            loadDashboardData()
        }
    }
    
    fun dismissError() {
        _errorMessage.value = null
    }
}

class AnalysisViewModel(private val repository: PhishingRepository) : ViewModel() {
    
    // Input text
    private val _inputText = MutableStateFlow("")
    val inputText: StateFlow<String> = _inputText.asStateFlow()
    
    // Source
    private val _selectedSource = MutableStateFlow("email")
    val selectedSource: StateFlow<String> = _selectedSource.asStateFlow()
    
    // Analysis result
    private val _analysisResult = MutableStateFlow<Result<Any>?>(null)
    val analysisResult: StateFlow<Result<Any>?> = _analysisResult.asStateFlow()
    
    // Loading and error
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    fun setInputText(text: String) {
        _inputText.value = text
    }
    
    fun setSelectedSource(source: String) {
        _selectedSource.value = source
    }
    
    fun analyzeMessage() {
        if (_inputText.value.isEmpty()) {
            _errorMessage.value = "Please enter a message"
            return
        }
        
        viewModelScope.launch {
            try {
                _isLoading.value = true
                _errorMessage.value = null
                
                val result = repository.analyzeMessage(
                    text = _inputText.value,
                    source = _selectedSource.value
                )
                
                when (result) {
                    is Result.Success -> {
                        repository.saveAnalyizedMessage(
                            response = result.data,
                            originalText = _inputText.value,
                            source = _selectedSource.value
                        )
                        _analysisResult.value = result
                        _inputText.value = "" // Clear input
                    }
                    is Result.Error -> {
                        _errorMessage.value = result.exception.message ?: "Analysis failed"
                    }
                }
                
                _isLoading.value = false
            } catch (e: Exception) {
                _errorMessage.value = e.message ?: "Unknown error"
                _isLoading.value = false
            }
        }
    }
    
    fun dismissError() {
        _errorMessage.value = null
    }
    
    fun clearResult() {
        _analysisResult.value = null
    }
}

class HealthCheckViewModel(private val repository: PhishingRepository) : ViewModel() {
    
    private val _healthStatus = MutableStateFlow<String>("Checking...")
    val healthStatus: StateFlow<String> = _healthStatus.asStateFlow()
    
    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        checkHealth()
    }
    
    fun checkHealth() {
        viewModelScope.launch {
            _isLoading.value = true
            
            val result = repository.checkHealth()
            when (result) {
                is Result.Success -> {
                    _healthStatus.value = "✅ Backend Connected"
                    _isConnected.value = true
                }
                is Result.Error -> {
                    _healthStatus.value = "❌ Backend Unavailable"
                    _isConnected.value = false
                }
            }
            
            _isLoading.value = false
        }
    }
}
