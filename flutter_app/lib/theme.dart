import 'package:material_ui/material_ui.dart';

abstract final class PayPulseColors {
  static const ink = Color(0xFF18364B);
  static const inkDark = Color(0xFF102A3C);
  static const paper = Color(0xFFF4F1E9);
  static const card = Color(0xFFFFFEFA);
  static const line = Color(0xFFD9D4C9);
  static const text = Color(0xFF202A31);
  static const muted = Color(0xFF65727A);
  static const coral = Color(0xFFD56B4C);
  static const coralLight = Color(0xFFF7E5DC);
  static const teal = Color(0xFF287565);
  static const amber = Color(0xFFB4772E);
  static const danger = Color(0xFFB84F45);
}

ThemeData buildPayPulseTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: PayPulseColors.ink,
    brightness: Brightness.light,
    surface: PayPulseColors.card,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme.copyWith(
      primary: PayPulseColors.ink,
      secondary: PayPulseColors.coral,
      surface: PayPulseColors.card,
      error: PayPulseColors.danger,
    ),
    scaffoldBackgroundColor: PayPulseColors.paper,
    appBarTheme: const AppBarTheme(
      backgroundColor: PayPulseColors.paper,
      foregroundColor: PayPulseColors.text,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: PayPulseColors.text,
        fontSize: 20,
        fontWeight: FontWeight.w700,
      ),
    ),
    cardTheme: CardThemeData(
      color: PayPulseColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: PayPulseColors.line),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: PayPulseColors.card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: PayPulseColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: PayPulseColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6),
        borderSide: const BorderSide(color: PayPulseColors.ink, width: 1.5),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: PayPulseColors.coral,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        textStyle: const TextStyle(fontWeight: FontWeight.w700),
      ),
    ),
    dividerColor: PayPulseColors.line,
  );
}
