import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../collector_provider.dart';
import '../../shared/ui_components.dart';
import '../../theme/app_theme.dart';

class LotDetailScreen extends StatelessWidget {
  final Map<String, dynamic> lot;
  const LotDetailScreen({Key? key, required this.lot}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final hasActive = Provider.of<CollectorProvider>(context, listen: false).activeCollection != null;
    final cat = lot['category']?.toString() ?? '';
    final wt = (lot['weight_kg'] ?? 0) as num;
    final price = (lot['price_per_kg'] ?? 0) as num;
    final total = price * wt;

    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Détail du lot')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Center(child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(24)),
              child: const Icon(Icons.recycling, size: 56, color: AppTheme.brand),
            )),
            const SizedBox(height: 20),
            Text("$wt kg de ${cat[0]}${cat.substring(1).toLowerCase()}",
                textAlign: TextAlign.center, style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            if (lot['description'] != null && (lot['description'] as String).isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(lot['description'], textAlign: TextAlign.center, style: const TextStyle(color: AppTheme.textSoft, fontSize: 15)),
            ],
            const SizedBox(height: 24),
            Row(children: [
              Expanded(child: _infoCard('Poids', '$wt kg')),
              const SizedBox(width: 12),
              Expanded(child: _infoCard('Prix/kg', '$price FCFA')),
              const SizedBox(width: 12),
              Expanded(child: _infoCard('Total', '${total.toStringAsFixed(0)} FCFA')),
            ]),
            const SizedBox(height: 20),
            EcoUI.surfaceCard(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text("Localisation", style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
                const SizedBox(height: 8),
                Text("Lat: ${lot['latitude']}", style: const TextStyle(color: AppTheme.textSoft, fontSize: 13)),
                Text("Lon: ${lot['longitude']}", style: const TextStyle(color: AppTheme.textSoft, fontSize: 13)),
              ]),
            ),
            const SizedBox(height: 20),
            Center(child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: (lot['status']?.toString() == 'disponible' ? AppTheme.info : AppTheme.warn).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(lot['status']?.toString() ?? '', style: TextStyle(
                  color: lot['status']?.toString() == 'disponible' ? AppTheme.info : AppTheme.warn,
                  fontSize: 12, fontWeight: FontWeight.w600)),
            )),
            if (!hasActive && lot['status']?.toString() == 'disponible') ...[
              const SizedBox(height: 28),
              EcoUI.primaryButton(label: "Réserver ce lot", icon: Icons.shopping_cart_outlined, onPressed: () async {
                final provider = Provider.of<CollectorProvider>(context, listen: false);
                final ok = await provider.reserveLot(lot['id']);
                if (context.mounted && ok) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lot réservé !'), backgroundColor: AppTheme.brand));
                  Navigator.pop(context);
                }
              }),
            ],
          ]),
        ),
      ),
    );
  }

  Widget _infoCard(String label, String value) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppTheme.inkHigh, borderRadius: BorderRadius.circular(AppTheme.rCard), border: Border.all(color: AppTheme.borderMed)),
        child: Column(children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textFaint, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
        ]),
      );
}
