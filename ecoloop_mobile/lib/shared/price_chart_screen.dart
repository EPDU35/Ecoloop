import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../core/api_service.dart';
import '../theme/app_theme.dart';
import '../core/animation_helper.dart';

class PriceChartScreen extends StatefulWidget {
  final String category;
  const PriceChartScreen({Key? key, required this.category}) : super(key: key);
  @override
  State<PriceChartScreen> createState() => _PriceChartScreenState();
}

class _PriceChartScreenState extends State<PriceChartScreen> {
  List<dynamic> _predictions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.post('/ai/predict/price', {
        'material': widget.category.toLowerCase(),
        'periods': 30,
      });
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        _predictions = data['predictions'] ?? [];
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: Text("Prévisions ${widget.category.toLowerCase()}")),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
          : _predictions.isEmpty
              ? const Center(child: Text("Aucune donnée disponible", style: TextStyle(color: AppTheme.textSoft)))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      AnimationHelper.slideUp(
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: AppTheme.inkHigh,
                            borderRadius: BorderRadius.circular(AppTheme.rCard),
                            border: Border.all(color: AppTheme.brand.withValues(alpha: 0.3)),
                          ),
                          child: Column(children: [
                            const Icon(Icons.trending_up, size: 40, color: AppTheme.brand),
                            const SizedBox(height: 12),
                            Text("Prévisions de prix sur 30 jours",
                                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                          ]),
                        ),
                      ),
                      const SizedBox(height: 20),
                      ..._predictions.take(30).toList().asMap().entries.map((entry) {
                        final pred = entry.value;
                        final price = pred['price'] ?? pred['yhat'] ?? 0;
                        final date = pred['date'] ?? pred['ds'] ?? 'J${entry.key + 1}';
                        final minP = pred['price_min'] ?? pred['yhat_lower'] ?? price;
                        final maxP = pred['price_max'] ?? pred['yhat_upper'] ?? price;
                        return AnimationHelper.fadeIn(
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              color: AppTheme.inkHigh,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.borderMed),
                            ),
                            child: Row(children: [
                              Text(date.toString().substring(0, 10), style: const TextStyle(color: AppTheme.textSoft, fontSize: 12)),
                              const Spacer(),
                              Text("$price FCFA/kg",
                                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppTheme.brand)),
                              if (minP != maxP) ...[
                                const SizedBox(width: 8),
                                Text("($minP-$maxP)", style: const TextStyle(color: AppTheme.textFaint, fontSize: 11)),
                              ],
                            ]),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
    );
  }
}
