package com.qshield.phishingdetector.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF6366F1),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFEEF0FF),
    onPrimaryContainer = Color(0xFF1E1B4B),
    
    secondary = Color(0xFF8B5CF6),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF3E8FF),
    onSecondaryContainer = Color(0xFF3F0B67),
    
    tertiary = Color(0xFF06B6D4),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFCFFAFE),
    onTertiaryContainer = Color(0xFF00383A),
    
    error = Color(0xFFFF6B6B),
    onError = Color.White,
    errorContainer = Color(0xFFFFEBEE),
    onErrorContainer = Color(0xFF600F0F),
    
    background = Color(0xFFFAFAFA),
    onBackground = Color(0xFF1A1A1A),
    
    surface = Color(0xFFFAFAFA),
    onSurface = Color(0xFF1A1A1A),
    surfaceVariant = Color(0xFFF0F0F0),
    onSurfaceVariant = Color(0xFF4A4A4A)
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF8B9EFF),
    onPrimary = Color(0xFF1A1B4B),
    primaryContainer = Color(0xFF3F3863),
    onPrimaryContainer = Color(0xFFEEF0FF),
    
    secondary = Color(0xFFD8B4FE),
    onSecondary = Color(0xFF2A0B4D),
    secondaryContainer = Color(0xFF4D1B7F),
    onSecondaryContainer = Color(0xFFF3E8FF),
    
    tertiary = Color(0xFF80F9FF),
    onTertiary = Color(0xFF003638),
    tertiaryContainer = Color(0xFF00515A),
    onTertiaryContainer = Color(0xFFCFFAFE),
    
    error = Color(0xFFFF8A80),
    onError = Color(0xFF600F0F),
    errorContainer = Color(0xFF8C0000),
    onErrorContainer = Color(0xFFFFEBEE),
    
    background = Color(0xFF1A1A1A),
    onBackground = Color(0xFFFAFAFA),
    
    surface = Color(0xFF252525),
    onSurface = Color(0xFFFAFAFA),
    surfaceVariant = Color(0xFF3A3A3A),
    onSurfaceVariant = Color(0xFFDDDDDD)
)

@Composable
fun QShieldTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
