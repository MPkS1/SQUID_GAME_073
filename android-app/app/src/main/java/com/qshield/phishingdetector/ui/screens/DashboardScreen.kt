package com.qshield.phishingdetector.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qshield.phishingdetector.data.model.DashboardUiState
import com.qshield.phishingdetector.ui.viewmodel.DashboardViewModel

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToAnalysis: () -> Unit,
    onNavigateToHistory: () -> Unit
) {
    val dashboardState by viewModel.dashboardUiState.collectAsState()
    val recentMessages by viewModel.recentMessages.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.refreshData()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        // Header
        TopAppBar(
            title = { Text("🛡️ QShield AI") },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        )
        
        if (errorMessage != null) {
            ErrorBanner(
                message = errorMessage!!,
                onDismiss = { viewModel.dismissError() }
            )
        }
        
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Statistics Cards
            item {
                StatisticsSection(dashboardState)
            }
            
            // Action Buttons
            item {
                ActionButtonsRow(
                    onAnalyzeClick = onNavigateToAnalysis,
                    onViewHistoryClick = onNavigateToHistory
                )
            }
            
            // Recent High Risk
            item {
                Text(
                    "🔴 High Risk Notifications",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }
            
            items(recentMessages.take(5).size) { index ->
                val message = recentMessages[index]
                NotificationCard(
                    source = message.source,
                    text = message.messageText.take(100),
                    riskScore = message.riskScore,
                    riskLevel = message.riskLevel,
                    timestamp = message.timestamp,
                    onDelete = { viewModel.deleteMessage(message) }
                )
            }
        }
    }
}

@Composable
fun StatisticsSection(state: DashboardUiState) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        // Total and Rating
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.primaryContainer)
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    "Total Notifications",
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    fontSize = 14.sp
                )
                Text(
                    state.totalNotifications.toString(),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
            
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "Average Risk",
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    fontSize = 14.sp
                )
                Text(
                    String.format("%.1f/100", state.averageRiskScore),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }
        }
        
        // Risk Breakdown
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            RiskStatCard(
                label = "High",
                count = state.highRiskCount,
                color = Color(0xFFFF6B6B),
                modifier = Modifier.weight(1f)
            )
            
            RiskStatCard(
                label = "Medium",
                count = state.mediumRiskCount,
                color = Color(0xFFFFA500),
                modifier = Modifier.weight(1f)
            )
            
            RiskStatCard(
                label = "Safe",
                count = state.safeCount,
                color = Color(0xFF4CAF50),
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun RiskStatCard(
    label: String,
    count: Int,
    color: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(color.copy(alpha = 0.1f))
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            label,
            fontSize = 12.sp,
            color = color
        )
        Text(
            count.toString(),
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}

@Composable
fun ActionButtonsRow(
    onAnalyzeClick: () -> Unit,
    onViewHistoryClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Button(
            onClick = onAnalyzeClick,
            modifier = Modifier
                .weight(1f)
                .height(48.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Icon(Icons.Default.Edit, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("Analyze")
        }
        
        OutlinedButton(
            onClick = onViewHistoryClick,
            modifier = Modifier
                .weight(1f)
                .height(48.dp)
        ) {
            Icon(Icons.Default.History, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("History")
        }
    }
}

@Composable
fun NotificationCard(
    source: String,
    text: String,
    riskScore: Int,
    riskLevel: String,
    timestamp: Long,
    onDelete: () -> Unit = {}
) {
    val riskColor = when (riskLevel) {
        "RED" -> Color(0xFFFF6B6B)
        "ORANGE" -> Color(0xFFFFA500)
        else -> Color(0xFF4CAF50)
    }
    
    val riskEmoji = when (riskLevel) {
        "RED" -> "🔴"
        "ORANGE" -> "🟠"
        else -> "🟢"
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
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
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        source,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
                            .padding(4.dp, 2.dp)
                    )
                    
                    Spacer(Modifier.width(8.dp))
                    
                    Text(
                        "$riskEmoji $riskScore/100",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = riskColor
                    )
                }
                
                IconButton(onClick = onDelete, modifier = Modifier.size(24.dp)) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            
            Spacer(Modifier.height(4.dp))
            
            Text(
                text,
                fontSize = 13.sp,
                maxLines = 2
            )
        }
    }
}

@Composable
fun ErrorBanner(message: String, onDismiss: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFF6B6B).copy(alpha = 0.9f)),
        color = Color(0xFFFF6B6B).copy(alpha = 0.9f)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "⚠️ $message",
                color = Color.White,
                fontSize = 12.sp,
                modifier = Modifier.weight(1f)
            )
            
            IconButton(onClick = onDismiss, modifier = Modifier.size(24.dp)) {
                Icon(
                    Icons.Default.Close,
                    contentDescription = "Dismiss",
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}
