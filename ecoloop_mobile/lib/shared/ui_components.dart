import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_theme.dart';
import '../core/animation_helper.dart';

class EcoUI {
  static double r = AppTheme.rInput;

  static Widget primaryButton({
    required String label,
    required VoidCallback? onPressed,
    bool loading = false,
    IconData? icon,
  }) =>
      SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: loading ? null : onPressed,
          child: loading
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.black)))
              : Row(mainAxisAlignment: MainAxisAlignment.center, mainAxisSize: MainAxisSize.min, children: [
                  if (icon != null) ...[Icon(icon, size: 20), const SizedBox(width: 10)],
                  Text(label),
                ]),
        ),
      );

  static Widget ghostButton({
    required String label,
    required VoidCallback? onPressed,
    Color color = AppTheme.textSoft,
  }) =>
      SizedBox(
        width: double.infinity,
        child: TextButton(
          onPressed: onPressed,
          child: Text(label, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: color)),
        ),
      );

  static Widget surfaceCard({required Widget child, EdgeInsets? padding}) => Container(
        width: double.infinity,
        padding: padding ?? const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppTheme.inkHigh,
          borderRadius: BorderRadius.circular(AppTheme.rCard),
          border: Border.all(color: AppTheme.borderMed),
        ),
        child: child,
      );

  static Widget emptyState({
    required IconData icon,
    required String title,
    String? subtitle,
    String? actionLabel,
    VoidCallback? onAction,
  }) =>
      Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: AnimationHelper.fadeIn(
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.12), shape: BoxShape.circle),
                child: Icon(icon, size: 36, color: AppTheme.brand),
              ),
              const SizedBox(height: 20),
              Text(title, textAlign: TextAlign.center, style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              if (subtitle != null) ...[const SizedBox(height: 8), Text(subtitle, textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: AppTheme.textSoft, height: 1.5))],
              if (actionLabel != null && onAction != null) ...[const SizedBox(height: 20), SizedBox(width: 220, child: primaryButton(label: actionLabel, onPressed: onAction))],
            ]),
          ),
        ),
      );

  static Widget statCard({required String label, required String value, required IconData icon, Color? accent}) => AnimationHelper.fadeIn(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.inkHigh,
            borderRadius: BorderRadius.circular(AppTheme.rCard),
            border: Border.all(color: AppTheme.borderMed),
          ),
          child: Row(children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: (accent ?? AppTheme.brand).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 22, color: accent ?? AppTheme.brand),
            ),
            const SizedBox(width: 14),
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.textSoft)),
              const SizedBox(height: 2),
              Text(value, style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            ]),
          ]),
        ),
      );

  static Widget shimmerLoading({int lines = 4}) => Shimmer.fromColors(
        baseColor: AppTheme.inkMid,
        highlightColor: AppTheme.inkLow,
        child: Column(
          children: List.generate(lines, (i) => Padding(
            padding: EdgeInsets.only(bottom: i < lines - 1 ? 12 : 0),
            child: Container(
              height: 72,
              decoration: BoxDecoration(
                color: AppTheme.inkHigh,
                borderRadius: BorderRadius.circular(AppTheme.rCard),
              ),
            ),
          )),
        ),
      );

  static Widget shimmerCard() => Shimmer.fromColors(
        baseColor: AppTheme.inkMid,
        highlightColor: AppTheme.inkLow,
        child: Container(
          height: 180,
          decoration: BoxDecoration(
            color: AppTheme.inkHigh,
            borderRadius: BorderRadius.circular(AppTheme.rCard),
          ),
        ),
      );

  static Widget networkImage(String? url, {double size = 48}) {
    if (url == null || url.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
        child: const Icon(Icons.image_outlined, size: 22, color: AppTheme.brand),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: CachedNetworkImage(
        imageUrl: url,
        width: size,
        height: size,
        fit: BoxFit.cover,
        placeholder: (_, __) => Container(color: AppTheme.inkMid),
        errorWidget: (_, __, ___) => Container(
          color: AppTheme.inkMid,
          child: const Icon(Icons.broken_image, color: AppTheme.textFaint),
        ),
      ),
    );
  }

  static Future<T?> showLoadingDialog<T>(BuildContext context, {String message = 'Chargement...'}) {
    return showDialog<T>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: Center(
          child: Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: AppTheme.inkHigh,
              borderRadius: BorderRadius.circular(AppTheme.rCard),
            ),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const SizedBox(
                width: 36, height: 36,
                child: CircularProgressIndicator(strokeWidth: 3, color: AppTheme.brand),
              ),
              const SizedBox(height: 16),
              Text(message, style: const TextStyle(color: AppTheme.textSoft, fontSize: 14)),
            ]),
          ),
        ),
      ),
    );
  }
}
