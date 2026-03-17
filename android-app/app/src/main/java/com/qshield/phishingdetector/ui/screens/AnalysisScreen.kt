package com.qshield.phishingdetector.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import com.qshield.phishingdetector.data.model.AnalysisResponse
import com.qshield.phishingdetector.data.repository.Result
import com.qshield.phishingdetector.ui.viewmodel.AnalysisViewModel

@Composable
fun AnalysisScreen(
    viewModel: AnalysisViewModel,
    onBackClick: () -> Unit
) {
    val inputText by viewModel.inputText.collectAsState()
    val selectedSource by viewModel.selectedSource.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val analysisResult by viewModel.analysisResult.collectAsState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.surface)
    ) {
        // Header
        TopAppBar(
            title = { Text("Analyze Message") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        )
        
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Error Message
            if (errorMessage != null) {
                item {
                    ErrorBanner(
                        message = errorMessage!!,
                        onDismiss = { viewModel.dismissError() }
                    )
                }
            }
            
            // Input Section
            item {
                AnalysisInputSection(
                    inputText = inputText,
                    selectedSource = selectedSource,
                    onInputChange = { viewModel.setInputText(it) },
                    onSourceChange = { viewModel.setSelectedSource(it) },
                    isLoading = isLoading
                )
            }
            
            // Analyze Button
            item {
                Button(
                    onClick = { viewModel.analyzeMessage() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !isLoading && inputText.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                        Spacer(Modifier.width(8.dp))
                    }
                    Text(
                        if (isLoading) "Analyzing..." else "🔍 Analyze Message",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            // Results
            if (analysisResult != null) {
                when (val result = analysisResult!!) {
                    is Result.Success -> {
                        item {
                            AnalysisResultSection(
                                response = result.data,
                                onClear = { viewModel.clearResult() }
                            )
                        }
                    }
                    is Result.Error -> {
                        item {
                            ErrorBanner(
                                message = result.exception.message ?: "Analysis failed",
                                onDismiss = { viewModel.clearResult() }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AnalysisInputSection(
    inputText: String,
    selectedSource: String,
    onInputChange: (String) -> Unit,
    onSourceChange: (String) -> Unit,
    isLoading: Boolean
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(
            "Select Source",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
        
        SourceSelector(
            selectedSource = selectedSource,
            onSourceChange = onSourceChange,
            isLoading = isLoading
        )
        
        Text(
            "Paste Message Content",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.paddingFromBaseline(top = 24.dp)
        )
        
        OutlinedTextField(
            value = inputText,
            onValueChange = onInputChange,
            placeholder = { Text("Paste email, SMS, or notification content...") },
            modifier = Modifier
                .fillMaxWidth()
                .height(150.dp),
            maxLines = 10,
            enabled = !isLoading
        )
    }
}

@Composable
fun SourceSelector(
    selectedSource: String,
    onSourceChange: (String) -> Unit,
    isLoading: Boolean
) {
    val sources = listOf("email", "sms", "chat")
    val sourceLables = listOf("📧 Email", "📱 SMS", "💬 Chat")
    
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        sources.forEachIndexed { index, source ->
            FilterChip(
                selected = selectedSource == source,
                onClick = { onSourceChange(source) },
                label = { Text(sourceLables[index]) },
                enabled = !isLoading,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun AnalysisResultSection(
    response: AnalysisResponse,
    onClear: () -> Unit
) {
    val riskColor = when {
        response.finalRiskScore >= 70 -> Color(0xFFFF6B6B)
        response.finalRiskScore >= 40 -> Color(0xFFFFA500)
        else -> Color(0xFF4CAF50)
    }
    
    val riskEmoji = when {
        response.finalRiskScore >= 70 -> "🔴"
        response.finalRiskScore >= 40 -> "🟠"
        else -> "🟢"
    }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.padding(top = 8.dp)
    ) {
        // Risk Score Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = riskColor.copy(alpha = 0.1f)
            ),
            border = CardDefaults.outlinedCardBorder().copy(
                color = riskColor
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    riskEmoji,
                    fontSize = 32.sp
                )
                
                Text(
                    "${response.finalRiskScore}/100",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = riskColor
                )
                
                Text(
                    response.riskLevel,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = riskColor
                )
            }
        }
        
        // Explanation
        Text(
            "Analysis",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant
            )
        ) {
            Text(
                response.explanation,
                fontSize = 13.sp,
                modifier = Modifier.padding(12.dp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        // Flags
        if (response.allFlags.isNotEmpty()) {
            Text(
                "Detection Flags",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
            
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                response.allFlags.forEach { flag ->
                    AssistChip(
                        onClick = {},
                        label = { Text(flag, fontSize = 11.sp) }
                    )
                }
            }
        }
        
        // Detailed Analysis
        if (response.credentialHarvesting != null) {
            ExpandableSection(
                title = "🔐 Credential Harvesting",
                content = {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Risk Level: ${response.credentialHarvesting.credentialRiskLevel}")
                        Text("Score: ${response.credentialHarvesting.credentialScore}/100")
                        if (response.credentialHarvesting.credentialTypesRequested.isNotEmpty()) {
                            Text("Types Requested:")
                            response.credentialHarvesting.credentialTypesRequested.forEach {
                                Text("• $it", fontSize = 12.sp)
                            }
                        }
                    }
                }
            )
        }
        
        if (response.anomalyDetection != null) {
            ExpandableSection(
                title = "⚠️ Anomalies Detected",
                content = {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Score: ${response.anomalyDetection.anomalyScore}/100")
                        response.anomalyDetection.anomaliesDetected.forEach {
                            Text("• $it", fontSize = 12.sp)
                        }
                    }
                }
            )
        }
        
        // Clear Button
        OutlinedButton(
            onClick = onClear,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Clear Results")
        }
    }
}

@Composable
fun ExpandableSection(
    title: String,
    content: @Composable () -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column {
            Button(
                onClick = { expanded = !expanded },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(40.dp),
                colors = ButtonDefaults.textButtonColors()
            ) {
                Text(title, modifier = Modifier.weight(1f))
                Text(if (expanded) "▼" else "▶")
            }
            
            if (expanded) {
                Divider()
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    content()
                }
            }
        }
    }
}

@Composable
fun FlowRow(
    modifier: Modifier = Modifier,
    horizontalArrangement: Arrangement.Horizontal = Arrangement.Start,
    verticalArrangement: Arrangement.Vertical = Arrangement.Top,
    content: @Composable () -> Unit
) {
    Layout(
        content = content,
        modifier = modifier
    ) { measurables, constraints ->
        val lines = mutableListOf<MutableList<Placeable>>()
        var currentLine = mutableListOf<Placeable>()
        var currentWidth = 0
        
        measurables.forEach { measurable ->
            val placeable = measurable.measure(constraints)
            if (currentWidth + placeable.width > constraints.maxWidth && currentLine.isNotEmpty()) {
                lines.add(currentLine)
                currentLine = mutableListOf()
                currentWidth = 0
            }
            currentLine.add(placeable)
            currentWidth += placeable.width
        }
        
        if (currentLine.isNotEmpty()) {
            lines.add(currentLine)
        }
        
        val height = lines.sumOf { it.maxOf { p -> p.height } }
        
        layout(constraints.maxWidth, height) {
            var y = 0
            lines.forEach { line ->
                var x = 0
                val lineHeight = line.maxOf { it.height }
                line.forEach { placeable ->
                    placeable.place(x, y)
                    x += placeable.width + 8.dp.roundToPx()
                }
                y += lineHeight + 8.dp.roundToPx()
            }
        }
    }
}

fun Int.roundToPx() = this
