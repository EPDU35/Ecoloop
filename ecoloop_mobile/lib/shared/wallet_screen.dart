import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../core/api_service.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';
import '../core/animation_helper.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({Key? key}) : super(key: key);
  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  List<dynamic> _txns = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.get('/transaction/history');
      if (res.statusCode == 200) _txns = jsonDecode(res.body);
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Portefeuille')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
          : _txns.isEmpty
              ? EcoUI.emptyState(icon: Icons.account_balance_wallet_outlined, title: "Aucune transaction", subtitle: "Vos transactions apparaîtront ici.")
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _txns.length,
                    itemBuilder: (ctx, i) {
                      final t = _txns[i];
                      final gross = (t['gross_amount'] ?? 0) as num;
                      final net = (t['net_amount'] ?? 0) as num;
                      final paid = t['status']?.toString().toLowerCase() == 'payee' || t['status']?.toString().toLowerCase() == 'payé';
                      return AnimationHelper.slideUp(
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
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
                              Text("$gross FCFA", style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                              const SizedBox(height: 2),
                              Text(t['payment_method']?.toString().toUpperCase() ?? '', style: const TextStyle(fontSize: 12, color: AppTheme.textSoft)),
                            ])),
                            Text("$net FCFA", style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.brand)),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
