package com.qshield.phishingdetector.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qshield.phishingdetector.data.model.AnalyzedMessage
import com.qshield.phishingdetector.ui.viewmodel.HistoryViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun HistoryScreen(
    viewModel: HistoryViewModel,
    onBackClick: () -> Unit
) {
    val messages by viewModel.messages.collectAsState()
    val filter by viewModel.filter.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        // Header
        TopAppBar(
            title = { Text("📋 Message History") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        )
        
        // Filter Row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            listOf(
                Pair("all", "All"),
                Pair("high_risk", "🔴"),
                Pair("medium_risk", "🟠"),
                Pair("safe", "🟢")
            ).forEach { (key, label) ->
                FilterChip(
                    selected = filter == key,
                    onClick = { viewModel.setFilter(key) },
                    label = { Text(label, fontSize = 12.sp) },
                    modifier = Modifier.height(32.dp)
                )
            }
        }
        
        if (isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (messages.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text("No messages yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages.size) { index ->
                    HistoryMessageCard(
                        message = messages[index],
                        onDelete = { viewModel.deleteMessage(messages[index]) }
                    )
                }
            }
        }
    }
}

@Composable
fun HistoryMessageCard(
    message: AnalyzedMessage,
    onDelete: () -> Unit
) {
    val riskColor = when (message.riskLevel) {
        "RED" -> Color(0xFFFF6B6B)
        "ORANGE" -> Color(0xFFFFA500)
        else -> Color(0xFF4CAF50)
    }
    
    val riskEmoji = when (message.riskLevel) {
        "RED" -> "🔴"
        "ORANGE" -> "🟠"
        else -> "🟢"
    }
    
    val timeFormat = SimpleDateFormat("MMM dd, HH:mm", Locale.getDefault())
    val timeString = timeFormat.format(Date(message.timestamp))
    
    Card(
        modifier = Modifier
            .fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            message.source,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier
                                .background(
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
                                    shape = MaterialTheme.shapes.small
                                )
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                        
                        Text(
                            "$riskEmoji ${message.riskScore}/100",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = riskColor
                        )
                    }
                    
                    Spacer(Modifier.height(6.dp))
                    
                    Text(
                        message.messageText.take(80),
                        fontSize = 12.sp,
                        maxLines = 2
                    )
                    
                    Spacer(Modifier.height(4.dp))
                    
                    Text(
                        timeString,
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                IconButton(
                    onClick = onDelete,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        modifier = Modifier.size(18.dp),
                        tint = Color(0xFFFF6B6B)
                    )
                }
            }
        }
    }
}

// Import for Delete icon
import androidx.compose.material.icons.filled.Delete
