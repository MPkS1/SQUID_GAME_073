package com.qshield.phishingdetector

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.qshield.phishingdetector.data.api.PhishingDetectorApi
import com.qshield.phishingdetector.data.database.PhishingDatabase
import com.qshield.phishingdetector.data.repository.PhishingRepository
import com.qshield.phishingdetector.ui.screens.AnalysisScreen
import com.qshield.phishingdetector.ui.screens.DashboardScreen
import com.qshield.phishingdetector.ui.screens.HistoryScreen
import com.qshield.phishingdetector.ui.theme.QShieldTheme
import com.qshield.phishingdetector.ui.viewmodel.AnalysisViewModel
import com.qshield.phishingdetector.ui.viewmodel.DashboardViewModel
import com.qshield.phishingdetector.ui.viewmodel.HistoryViewModel
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize API client
        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        val api = retrofit.create(PhishingDetectorApi::class.java)
        
        // Initialize database
        val database = PhishingDatabase.getInstance(this)
        val messageDao = database.messageDao()
        val statisticsDao = database.statisticsDao()
        
        // Initialize repository
        val repository = PhishingRepository(api, messageDao, statisticsDao)
        
        // Initialize ViewModels
        val dashboardViewModel = DashboardViewModel(repository)
        val analysisViewModel = AnalysisViewModel(repository)
        val historyViewModel = HistoryViewModel(repository)
        
        setContent {
            QShieldTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainNavigation(
                        dashboardViewModel = dashboardViewModel,
                        analysisViewModel = analysisViewModel,
                        historyViewModel = historyViewModel
                    )
                }
            }
        }
    }
}

@Composable
fun MainNavigation(
    dashboardViewModel: DashboardViewModel,
    analysisViewModel: AnalysisViewModel,
    historyViewModel: HistoryViewModel
) {
    val navController = rememberNavController()
    
    NavHost(
        navController = navController,
        startDestination = "dashboard"
    ) {
        composable("dashboard") {
            DashboardScreen(
                viewModel = dashboardViewModel,
                onNavigateToAnalysis = { navController.navigate("analysis") },
                onNavigateToHistory = { navController.navigate("history") }
            )
        }
        
        composable("analysis") {
            AnalysisScreen(
                viewModel = analysisViewModel,
                onBackClick = { navController.popBackStack() }
            )
        }
        
        composable("history") {
            HistoryScreen(
                viewModel = historyViewModel,
                onBackClick = { navController.popBackStack() }
            )
        }
    }
}
