import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'collector_provider.dart';
import '../auth/auth_provider.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';

class CollectorDashboard extends StatefulWidget {
  const CollectorDashboard({Key? key}) : super(key: key);
  @override
  State<CollectorDashboard> createState() => _CollectorDashboardState();
}

class _CollectorDashboardState extends State<CollectorDashboard> {
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => Provider.of<CollectorProvider>(context, listen: false).fetchData());
  }

  @override
  Widget build(BuildContext context) {
    final a = Provider.of<AuthProvider>(context);
    final name = a.user?['full_name']?.toString().split(' ').first ?? '';

    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      body: IndexedStack(index: _tab, children: [
        _home(name),
        _mesCollectes(),
        _recompenses(),
        _notifs(),
        _profil(),
      ]),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _tab,
        onTap: (i) => setState(() => _tab = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), activeIcon: Icon(Icons.explore), label: 'Explorer'),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_outlined), activeIcon: Icon(Icons.inventory), label: 'Collectes'),
          BottomNavigationBarItem(icon: Icon(Icons.stars_outlined), activeIcon: Icon(Icons.stars), label: 'Gains'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications_outlined), activeIcon: Icon(Icons.notifications), label: 'Notifs'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }

  Widget _home(String name) => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Consumer<CollectorProvider>(builder: (_, cp, __) {
            final active = cp.activeCollection;
            final lots = cp.availableLots;
            return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const SizedBox(height: 24),
              Text("Bonjour $name 👋", style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 6),
              const Text("Déchets disponibles autour de vous.", style: TextStyle(color: AppTheme.textSoft, fontSize: 15)),
              const SizedBox(height: 24),
              if (active != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.inkHigh,
                    borderRadius: BorderRadius.circular(AppTheme.rCard),
                    border: Border.all(color: AppTheme.warn.withValues(alpha: 0.4)),
                  ),
                  child: Column(children: [
                    Container(padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppTheme.warn.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.pending_actions, size: 28, color: AppTheme.warn)),
                    const SizedBox(height: 12),
                    Text("Collecte en cours", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                    const SizedBox(height: 4),
                    Text("${active['estimated_weight_kg']} kg estimés", style: const TextStyle(color: AppTheme.textSoft, fontSize: 14)),
                    const SizedBox(height: 16),
                    SizedBox(width: double.infinity, child: ElevatedButton(
                      onPressed: () => Navigator.pushNamed(context, '/collector/validate'),
                      child: const Text('Valider avec le code OTP'),
                    )),
                  ]),
                ),
                const SizedBox(height: 20),
              ],
              Text("À proximité", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 12),
              if (cp.loading)
                const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: AppTheme.brand)))
              else if (lots.isEmpty)
                EcoUI.emptyState(icon: Icons.storefront_outlined, title: "Aucun déchet disponible", subtitle: "Revenez plus tard ou élargissez votre zone.")
              else
                ...lots.map((lot) => _lotCard(lot)),
            ]);
          }),
        ),
      );

  Widget _lotCard(Map<String, dynamic> lot) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppTheme.inkHigh, borderRadius: BorderRadius.circular(AppTheme.rCard), border: Border.all(color: AppTheme.borderMed)),
        child: InkWell(
          onTap: () => Navigator.pushNamed(context, '/collector/lot-detail', arguments: lot),
          child: Row(children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppTheme.info.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.recycling, size: 22, color: AppTheme.info),
            ),
            const SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text("${lot['weight_kg']} kg de ${lot['category']?.toString().toLowerCase() ?? ''}",
                  style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 2),
              Text("${lot['price_per_kg']} FCFA/kg", style: const TextStyle(fontSize: 13, color: AppTheme.textSoft)),
            ])),
            const Icon(Icons.chevron_right, color: AppTheme.textFaint),
          ]),
        ),
      );

  Widget _mesCollectes() => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(height: 24),
            Text("Mes collectes", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 20),
            EcoUI.emptyState(icon: Icons.inventory_outlined, title: "Aucune collecte effectuée", subtitle: "Les collectes validées apparaîtront ici."),
          ]),
        ),
      );

  Widget _recompenses() => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(height: 24),
            Text("Mes gains", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 20),
            EcoUI.surfaceCard(
              child: Column(children: [
                Container(padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(Icons.monetization_on_outlined, size: 40, color: AppTheme.brand)),
                const SizedBox(height: 16),
                Text("0 FCFA", style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                const SizedBox(height: 4),
                const Text("Collectez pour percevoir des commissions.", style: TextStyle(color: AppTheme.textSoft, fontSize: 13)),
              ]),
            ),
          ]),
        ),
      );

  Widget _notifs() => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(height: 24),
            Text("Notifications", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 20),
            EcoUI.emptyState(icon: Icons.notifications_none_outlined, title: "Aucune notification", subtitle: "Les alertes de mission apparaîtront ici."),
          ]),
        ),
      );

  Widget _profil() => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Consumer<AuthProvider>(builder: (_, a, __) {
            final u = a.user;
            return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const SizedBox(height: 24),
              Text("Profil", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 20),
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
              const SizedBox(height: 32),
              _infoRow(Icons.email_outlined, u?['email'] ?? ''),
              _infoRow(Icons.phone_outlined, u?['phone'] ?? ''),
              _infoRow(Icons.badge_outlined, u?['role']?.toString().toLowerCase() ?? ''),
              const SizedBox(height: 40),
              SizedBox(width: double.infinity, child: TextButton.icon(
                onPressed: () async { await a.logout(); if (mounted) Navigator.pushReplacementNamed(context, '/login'); },
                icon: const Icon(Icons.logout, color: AppTheme.error),
                label: const Text('Déconnexion', style: TextStyle(color: AppTheme.error)),
                style: TextButton.styleFrom(backgroundColor: AppTheme.inkMid, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.rInput))),
              )),
            ]);
          }),
        ),
      );

  Widget _infoRow(IconData ic, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(children: [
          Icon(ic, size: 20, color: AppTheme.textFaint), const SizedBox(width: 12),
          Text(v, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15)),
        ]),
      );
}
