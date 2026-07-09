import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../auth/auth_provider.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ProducerDashboard extends StatefulWidget {
  const ProducerDashboard({Key? key}) : super(key: key);
  @override
  State<ProducerDashboard> createState() => _ProducerDashboardState();
}

class _ProducerDashboardState extends State<ProducerDashboard> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final a = Provider.of<AuthProvider>(context);
    final user = a.user;
    final name = user?['full_name']?.toString().split(' ').first ?? '';

    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      body: IndexedStack(
        index: _tab,
        children: [
          _home(name),
          _mesCollectes(),
          _recompenses(),
          _notifs(),
          _profil(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _tab,
        onTap: (i) => setState(() => _tab = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Accueil'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), activeIcon: Icon(Icons.receipt_long), label: 'Collectes'),
          BottomNavigationBarItem(icon: Icon(Icons.stars_outlined), activeIcon: Icon(Icons.stars), label: 'Récompenses'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications_outlined), activeIcon: Icon(Icons.notifications), label: 'Notifs'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profil'),
        ],
      ),
    );
  }

  Widget _home(String name) => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(height: 24),
            Text("Bonjour $name 👋", style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 6),
            const Text("Que voulez-vous faire aujourd'hui ?", style: TextStyle(color: AppTheme.textSoft, fontSize: 15)),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/producer/publish'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.brand,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 22),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.rCard)),
                ),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.add_circle_outline, size: 26),
                  const SizedBox(width: 12),
                  Text("Faire collecter mes déchets", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700)),
                ]),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(color: AppTheme.inkMid, borderRadius: BorderRadius.circular(AppTheme.rPill)),
                child: const Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.schedule, size: 16, color: AppTheme.textSoft),
                  SizedBox(width: 6),
                  Text("Aucun passage prévu pour le moment", style: TextStyle(color: AppTheme.textSoft, fontSize: 13)),
                ]),
              ),
            ),
            const SizedBox(height: 32),
            Text("Mon impact EcoLoop", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: EcoUI.statCard(label: 'kg recyclés', value: '0', icon: Icons.scale_outlined)),
              const SizedBox(width: 12),
              Expanded(child: EcoUI.statCard(label: 'Collectes', value: '0', icon: Icons.check_circle_outline)),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: EcoUI.statCard(label: 'Points EcoLoop', value: '0', icon: Icons.monetization_on_outlined)),
              const SizedBox(width: 12),
              Expanded(child: EcoUI.statCard(label: 'CO₂ évité', value: '0 kg', icon: Icons.eco_outlined)),
            ]),
            const SizedBox(height: 32),
            Text("Dernières collectes", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 14),
            EcoUI.emptyState(
              icon: Icons.inbox_outlined,
              title: "Aucune collecte pour l'instant",
              subtitle: "Publiez vos déchets pour commencer.",
              actionLabel: "Publier maintenant",
              onAction: () => Navigator.pushNamed(context, '/producer/publish'),
            ),
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
            EcoUI.emptyState(icon: Icons.receipt_long_outlined, title: "Aucune collecte", subtitle: "Les collectes que vous publierez apparaîtront ici."),
          ]),
        ),
      );

  Widget _recompenses() => SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(height: 24),
            Text("Récompenses", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            const SizedBox(height: 20),
            EcoUI.surfaceCard(
              child: Column(children: [
                Container(padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(Icons.stars, size: 40, color: AppTheme.brand)),
                const SizedBox(height: 16),
                Text("0 point", style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                const SizedBox(height: 4),
                const Text("Collectez pour gagner des points échangeables.", style: TextStyle(color: AppTheme.textSoft, fontSize: 13)),
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
            EcoUI.emptyState(icon: Icons.notifications_none_outlined, title: "Aucune notification", subtitle: "Les alertes de collecte apparaîtront ici."),
          ]),
        ),
      );

  Widget _profil() => ProfileContent();
}

/// Encapsulé pour réutilisation.
class ProfileContent extends StatefulWidget {
  @override
  State<ProfileContent> createState() => _ProfileContentState();
}
class _ProfileContentState extends State<ProfileContent> {
  final _nameC = TextEditingController(), _phoneC = TextEditingController();
  final _key = GlobalKey<FormState>();
  bool _edit = false, _loading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final u = Provider.of<AuthProvider>(context).user;
    if (u != null) { _nameC.text = u['full_name'] ?? ''; _phoneC.text = u['phone'] ?? ''; }
  }

  @override
  void dispose() { _nameC.dispose(); _phoneC.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_key.currentState!.validate()) return;
    setState(() => _loading = true);
    // API PATCH /users/me
    final res = await http.patch(
      Uri.parse('http://localhost:8000/api/v1/users/me'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'full_name': _nameC.text.trim(), 'phone': _phoneC.text.trim()}),
    );
    setState(() => _loading = false);
    if (!mounted) return;
    if (res.statusCode == 200) {
      setState(() => _edit = false);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profil mis à jour'), backgroundColor: AppTheme.brand));
    }
  }

  @override
  Widget build(BuildContext context) {
    final a = Provider.of<AuthProvider>(context);
    final u = a.user;
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _key,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const SizedBox(height: 24),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text("Profil", style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              TextButton(onPressed: () => setState(() => _edit = !_edit), child: Text(_edit ? 'Annuler' : 'Modifier')),
            ]),
            const SizedBox(height: 20),
            Center(child: Column(children: [
              Container(padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                child: Text((u?['full_name']?.toString() ?? '?')[0].toUpperCase(),
                    style: GoogleFonts.outfit(fontSize: 36, fontWeight: FontWeight.w700, color: AppTheme.brand))),
              const SizedBox(height: 12),
              if (!_edit) ...[
                Text(u?['full_name'] ?? '', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                const SizedBox(height: 4),
                Container(padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                  child: Text(u?['role']?.toString() ?? '', style: const TextStyle(color: AppTheme.brand, fontSize: 12, fontWeight: FontWeight.w600))),
              ],
            ])),
            const SizedBox(height: 32),
            if (_edit) ...[
              TextFormField(controller: _nameC, decoration: const InputDecoration(hintText: 'Nom complet', prefixIcon: Icon(Icons.person_outline, color: AppTheme.textFaint))),
              const SizedBox(height: 14),
              TextFormField(controller: _phoneC, keyboardType: TextInputType.phone,
                decoration: const InputDecoration(hintText: 'Téléphone', prefixIcon: Icon(Icons.phone_outlined, color: AppTheme.textFaint))),
              const SizedBox(height: 24),
              EcoUI.primaryButton(label: 'Enregistrer', loading: _loading, onPressed: _save),
            ] else ...[
              _infoRow(Icons.email_outlined, u?['email'] ?? ''),
              _infoRow(Icons.phone_outlined, u?['phone'] ?? ''),
              _infoRow(Icons.badge_outlined, u?['role']?.toString().toLowerCase() ?? ''),
            ],
            const SizedBox(height: 40),
            SizedBox(width: double.infinity, child: TextButton.icon(
              onPressed: () async { await a.logout(); if (mounted) Navigator.pushReplacementNamed(context, '/login'); },
              icon: const Icon(Icons.logout, color: AppTheme.error),
              label: const Text('Déconnexion', style: TextStyle(color: AppTheme.error)),
              style: TextButton.styleFrom(backgroundColor: AppTheme.inkMid, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.rInput))),
            )),
          ]),
        ),
      ),
    );
  }

  Widget _infoRow(IconData ic, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(children: [
          Icon(ic, size: 20, color: AppTheme.textFaint), const SizedBox(width: 12),
          Text(v, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15)),
        ]),
      );
}
