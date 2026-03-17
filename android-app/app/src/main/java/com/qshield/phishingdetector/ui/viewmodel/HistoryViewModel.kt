package com.qshield.phishingdetector.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qshield.phishingdetector.data.model.AnalyzedMessage
import com.qshield.phishingdetector.data.repository.PhishingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HistoryViewModel(private val repository: PhishingRepository) : ViewModel() {
    
    private val _filter = MutableStateFlow("all")
    val filter: StateFlow<String> = _filter.asStateFlow()
    
    private val _messages = MutableStateFlow<List<AnalyzedMessage>>(emptyList())
    val messages: StateFlow<List<AnalyzedMessage>> = _messages.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        loadMessages()
    }
    
    fun setFilter(newFilter: String) {
        _filter.value = newFilter
        loadMessages()
    }
    
    private fun loadMessages() {
        viewModelScope.launch {
            _isLoading.value = true
            when (_filter.value) {
                "high_risk" -> repository.getHighRiskMessages().collect {
                    _messages.value = it
                }
                "medium_risk" -> repository.getMediumRiskMessages().collect {
                    _messages.value = it
                }
                "safe" -> repository.getSafeMessages().collect {
                    _messages.value = it
                }
                else -> repository.getAllMessages().collect {
                    _messages.value = it
                }
            }
            _isLoading.value = false
        }
    }
    
    fun deleteMessage(message: AnalyzedMessage) {
        viewModelScope.launch {
            repository.deleteMessage(message)
            loadMessages()
        }
    }
    
    fun deleteAllMessages() {
        viewModelScope.launch {
            repository.deleteAllMessages()
            _messages.value = emptyList()
        }
    }
}
