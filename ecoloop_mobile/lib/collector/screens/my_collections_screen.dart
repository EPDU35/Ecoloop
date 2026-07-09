import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../../core/api_service.dart';
import '../../shared/ui_components.dart';
import '../../theme/app_theme.dart';

class MyCollectionsScreen extends StatefulWidget {
  const MyCollectionsScreen({Key? key}) : super(key: key);
  @override
  State<MyCollectionsScreen> createState() => _MyCollectionsScreenState();
}

class _MyCollectionsScreenState extends State<MyCollectionsScreen> {
  List<dynamic> _collections = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.get('/transaction/history');
      if (res.statusCode == 200) _collections = jsonDecode(res.body);
    } catch (_) {}
    setState(() => _loading = false);
  }

  String _statusLabel(String? s) {
    switch (s?.toLowerCase()) {
      case 'payee': case 'payé': return 'Payée';
      case 'en_attente': return 'En attente';
      default: return s ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Mes collectes')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
          : RefreshIndicator(
              onRefresh: _load,
              child: _collections.isEmpty
                  ? ListView(children: [EcoUI.emptyState(icon: Icons.inventory_outlined, title: "Aucune collecte", subtitle: "Réservez un lot pour commencer.")])
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _collections.length,
                      itemBuilder: (ctx, i) {
                        final c = _collections[i];
                        final gross = (c['gross_amount'] ?? 0) as num;
                        final net = (c['net_amount'] ?? 0) as num;
                        final status = c['status']?.toString() ?? '';
                        final paid = status.toLowerCase() == 'payee' || status.toLowerCase() == 'payé';
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
                              decoration: BoxDecoration(
                                color: paid ? AppTheme.brand.withValues(alpha: 0.12) : AppTheme.warn.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(paid ? Icons.check_circle : Icons.schedule, size: 22, color: paid ? AppTheme.brand : AppTheme.warn),
                            ),
                            const SizedBox(width: 14),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text("$gross FCFA", style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                              const SizedBox(height: 2),
                              Text("Commission: ${c['commission_amount'] ?? 0} FCFA", style: const TextStyle(fontSize: 12, color: AppTheme.textSoft)),
                            ])),
                            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                              Text("$net FCFA", style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.brand)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: paid ? AppTheme.brand.withValues(alpha: 0.15) : AppTheme.warn.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(_statusLabel(status), style: TextStyle(color: paid ? AppTheme.brand : AppTheme.warn, fontSize: 10, fontWeight: FontWeight.w600)),
                              ),
                            ]),
                          ]),
                        );
                      },
                    ),
            ),
    );
  }
}
