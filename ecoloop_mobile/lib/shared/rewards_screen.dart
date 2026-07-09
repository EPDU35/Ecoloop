import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../core/api_service.dart';
import '../theme/app_theme.dart';
import '../core/animation_helper.dart';

class RewardsScreen extends StatefulWidget {
  const RewardsScreen({Key? key}) : super(key: key);
  @override
  State<RewardsScreen> createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  Map<String, dynamic>? _rewards;
  List<dynamic> _history = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await ApiService.get('/rewards/me');
      if (r.statusCode == 200) _rewards = jsonDecode(r.body);
      final h = await ApiService.get('/rewards/history');
      if (h.statusCode == 200) _history = jsonDecode(h.body);
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Récompenses')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
          : RefreshIndicator(
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (_rewards != null) ...[
                    AnimationHelper.scaleIn(
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppTheme.inkHigh,
                          borderRadius: BorderRadius.circular(AppTheme.rCard),
                          border: Border.all(color: AppTheme.brand.withValues(alpha: 0.3)),
                        ),
                        child: Column(children: [
                          Container(padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                            child: const Icon(Icons.emoji_events, size: 40, color: AppTheme.brand)),
                          const SizedBox(height: 16),
                          Text("${_rewards!['points']} pts", style: GoogleFonts.outfit(fontSize: 36, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                          const SizedBox(height: 4),
                          Text("Niveau ${_rewards!['level']?.toString().toUpperCase() ?? '-'}", style: const TextStyle(color: AppTheme.brand, fontWeight: FontWeight.w600, fontSize: 14)),
                          const SizedBox(height: 2),
                          Text("${_rewards!['total_kg_recycled'] ?? 0} kg recyclés", style: const TextStyle(color: AppTheme.textSoft, fontSize: 13)),
                        ]),
                      ),
                    ),
                    const SizedBox(height: 28),
                    Text("Historique", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                    const SizedBox(height: 14),
                  ],
                  if (_history.isEmpty && _rewards != null)
                    const Padding(padding: EdgeInsets.only(top: 32), child: Center(child: Text("Aucun mouvement.", style: TextStyle(color: AppTheme.textSoft))))
                  else
                    ..._history.map((h) => AnimationHelper.slideUp(
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(color: AppTheme.inkHigh, borderRadius: BorderRadius.circular(AppTheme.rCard), border: Border.all(color: AppTheme.borderMed)),
                        child: Row(children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: ((h['points'] ?? 0) as num) >= 0 ? AppTheme.brand.withValues(alpha: 0.12) : AppTheme.error.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(((h['points'] ?? 0) as num) >= 0 ? Icons.add_circle : Icons.remove_circle, size: 20,
                                color: ((h['points'] ?? 0) as num) >= 0 ? AppTheme.brand : AppTheme.error),
                          ),
                          const SizedBox(width: 14),
                          Expanded(child: Text(h['action']?.toString() ?? '', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14))),
                          Text("${h['points']} pts", style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.brand)),
                        ]),
                      ),
                    )),
                ],
              ),
            ),
    );
  }
}
