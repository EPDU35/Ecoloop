import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../auth/auth_provider.dart';
import '../theme/app_theme.dart';
import '../core/animation_helper.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final a = Provider.of<AuthProvider>(context);
    final u = a.user;
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Profil')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: AnimationHelper.staggeredList(children: [
            const SizedBox(height: 24),
            Center(child: Column(children: [
              Container(padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                child: Text((u?['full_name']?.toString() ?? '?')[0].toUpperCase(),
                    style: GoogleFonts.outfit(fontSize: 36, fontWeight: FontWeight.w700, color: AppTheme.brand))),
              const SizedBox(height: 12),
              Text(u?['full_name'] ?? '', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 4),
              Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                child: Text(u?['role']?.toString() ?? '', style: const TextStyle(color: AppTheme.brand, fontSize: 12, fontWeight: FontWeight.w600))),
            ])),
            const SizedBox(height: 40),
            _row(Icons.email_outlined, u?['email'] ?? ''),
            _row(Icons.phone_outlined, u?['phone'] ?? ''),
            _row(Icons.badge_outlined, u?['role']?.toString().toLowerCase() ?? ''),
            const SizedBox(height: 40),
            SizedBox(width: double.infinity, child: TextButton.icon(
              onPressed: () async { await a.logout(); if (context.mounted) Navigator.pushReplacementNamed(context, '/login'); },
              icon: const Icon(Icons.logout, color: AppTheme.error),
              label: const Text('Déconnexion', style: TextStyle(color: AppTheme.error)),
              style: TextButton.styleFrom(
                backgroundColor: AppTheme.inkMid,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.rInput)),
              ),
            )),
          ]),
        ),
      ),
    );
  }

  Widget _row(IconData ic, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(children: [
          Icon(ic, size: 20, color: AppTheme.textFaint), const SizedBox(width: 12),
          Text(v, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15)),
        ]),
      );
}
