import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Identité EcoLoop — inspiration Djamo pour la propreté, adapté à l'économie circulaire.
/// Un seul accent (vert), fond profond, cartes sans ombre, typo soignée.
class AppTheme {
  // --- Palette (verrouillée) ---
  static const Color brand = Color(0xFF10B981);
  static const Color brandAlt = Color(0xFF059669);

  static const Color inkFull = Color(0xFF0A0A0F);
  static const Color inkHigh = Color(0xFF121219);
  static const Color inkMid = Color(0xFF1A1A24);
  static const Color inkLow = Color(0xFF24242E);

  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSoft = Color(0xFFA1A1AA);
  static const Color textFaint = Color(0xFF52525B);

  static const Color borderLight = Color(0x0FFFFFFF);
  static const Color borderMed = Color(0x14FFFFFF);

  static const Color success = brand;
  static const Color warn = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Rayons
  static const double rCard = 20;
  static const double rInput = 14;
  static const double rPill = 999;

  // --- Rétro-compatibilité ---
  static const Color accentEmerald = brand;
  static const Color accentCyan = info;
  static const Color bgPrimary = inkFull;
  static const Color bgSecondary = inkHigh;
  static const Color textSecondary = textSoft;
  static const Color textStrong = textPrimary;
  static const Color ink800 = inkHigh;
  static const Color ink700 = inkMid;
  static const Color ink900 = inkFull;
  static const Color danger = error;
  static const double radiusCard = rCard;
  static const double radiusInput = rInput;

  static ThemeData get darkTheme => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: inkFull,
        primaryColor: brand,
        colorScheme: const ColorScheme.dark(
          primary: brand,
          secondary: brand,
          surface: inkHigh,
          error: error,
        ),
        textTheme: _tt,
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: inkMid,
          hintStyle: GoogleFonts.manrope(color: textFaint, fontSize: 14),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          border: _inputBorder(borderMed),
          enabledBorder: _inputBorder(borderMed),
          focusedBorder: _inputBorder(brand, 1.5),
          errorBorder: _inputBorder(error, 1.5),
        ),
        cardTheme: CardThemeData(
          color: inkHigh,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(rCard),
            side: const BorderSide(color: borderMed),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: brand,
            foregroundColor: Colors.black,
            textStyle: GoogleFonts.manrope(fontWeight: FontWeight.w700, fontSize: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(rInput)),
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: textSoft,
            textStyle: GoogleFonts.manrope(fontWeight: FontWeight.w600),
          ),
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: inkFull,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: GoogleFonts.outfit(
            fontSize: 20, fontWeight: FontWeight.w700, color: textPrimary,
          ),
          iconTheme: const IconThemeData(color: textPrimary),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: inkFull,
          selectedItemColor: brand,
          unselectedItemColor: textFaint,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedLabelStyle: GoogleFonts.manrope(fontWeight: FontWeight.w600, fontSize: 11),
          unselectedLabelStyle: GoogleFonts.manrope(fontSize: 11),
        ),
        useMaterial3: true,
      );

  static OutlineInputBorder _inputBorder(Color color, [double w = 1]) => OutlineInputBorder(
        borderRadius: BorderRadius.circular(rInput),
        borderSide: BorderSide(color: color, width: w),
      );

  static TextStyle _outfit(double s, FontWeight w, Color c, {double? h}) =>
      GoogleFonts.outfit(fontSize: s, fontWeight: w, color: c, height: h);

  static TextStyle _manrope(double s, FontWeight w, Color c, {double? h}) =>
      GoogleFonts.manrope(fontSize: s, fontWeight: w, color: c, height: h);

  static TextTheme get _tt => TextTheme(
        displaySmall: _outfit(30, FontWeight.w700, textPrimary, h: 1.1),
        headlineMedium: _outfit(26, FontWeight.w700, textPrimary, h: 1.15),
        titleLarge: _outfit(22, FontWeight.w700, textPrimary),
        titleMedium: _outfit(18, FontWeight.w600, textPrimary),
        bodyLarge: _manrope(16, FontWeight.w400, textPrimary, h: 1.5),
        bodyMedium: _manrope(14, FontWeight.w400, textSoft, h: 1.5),
        labelLarge: _manrope(15, FontWeight.w600, textSoft),
        labelMedium: _manrope(13, FontWeight.w600, textSoft),
      );
}
