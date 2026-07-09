import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../../core/api_service.dart';
import '../../shared/ui_components.dart';
import '../../theme/app_theme.dart';

class ProducerHistoryScreen extends StatefulWidget {
  const ProducerHistoryScreen({Key? key}) : super(key: key);
  @override
  State<ProducerHistoryScreen> createState() => _ProducerHistoryScreenState();
}

class _ProducerHistoryScreenState extends State<ProducerHistoryScreen> {
  List<dynamic> _lots = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.get('/my-wastes');
      if (res.statusCode == 200) _lots = jsonDecode(res.body);
    } catch (_) {}
    setState(() => _loading = false);
  }

  String _statusLabel(String? s) {
    switch (s?.toLowerCase()) {
      case 'disponible': return 'En attente';
      case 'reserve': return 'Réservé';
      case 'collecte': case 'collecté': return 'Collecté';
      case 'valide': return 'Validé';
      default: return s ?? 'Inconnu';
    }
  }

  Color _statusColor(String? s) {
    switch (s?.toLowerCase()) {
      case 'disponible': return AppTheme.info;
      case 'reserve': return AppTheme.warn;
      case 'collecte': case 'collecté': return AppTheme.brand;
      case 'valide': return AppTheme.success;
      default: return AppTheme.textFaint;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Historique')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
          : RefreshIndicator(
              onRefresh: _load,
              child: _lots.isEmpty
                  ? ListView(children: [EcoUI.emptyState(icon: Icons.receipt_long_outlined, title: "Aucun historique", subtitle: "Publiez votre premier lot pour voir l'historique.")])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _lots.length,
                      itemBuilder: (ctx, i) {
                        final lot = _lots[i];
                        final cat = lot['category']?.toString() ?? '';
                        final wt = lot['weight_kg'] ?? 0;
                        final status = lot['status']?.toString() ?? '';
                        final total = ((lot['price_per_kg'] ?? 0) as num).toDouble() * (wt as num).toDouble();
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.inkHigh,
                            borderRadius: BorderRadius.circular(AppTheme.rCard),
                            border: Border.all(color: AppTheme.borderMed),
                          ),
                          child: Row(children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(color: _statusColor(status).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                              child: Icon(Icons.recycling, size: 22, color: _statusColor(status)),
                            ),
                            const SizedBox(width: 14),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text("$wt kg ${cat[0]}${cat.substring(1).toLowerCase()}",
                                  style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(color: _statusColor(status).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(999)),
                                child: Text(_statusLabel(status), style: TextStyle(color: _statusColor(status), fontSize: 11, fontWeight: FontWeight.w600)),
                              ),
                            ])),
                            if (total > 0)
                              Text("${total.toStringAsFixed(0)} FCFA",
                                  style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.brand)),
                          ]),
                        );
                      },
                    ),
            ),
    );
  }
}
