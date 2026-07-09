import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../auth/auth_provider.dart';
import '../theme/app_theme.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  final _page = PageController();
  int _idx = 0;

  final _steps = const [
    _Step(Icons.sort_outlined, 'Triez ce que vous pouvez', 'Plastique, carton, métal, verre. Même un petit geste compte.'),
    _Step(Icons.camera_alt_outlined, 'Publiez votre collecte', 'Photo, adresse et créneau. Quelques secondes suffisent.'),
    _Step(Icons.local_shipping_outlined, 'Un collecteur passe chez vous', 'Après vérification du poids, vous recevez vos récompenses.'),
  ];

  @override
  void dispose() { _page.dispose(); super.dispose(); }

  void _go() => Navigator.pushReplacementNamed(context, '/login');

  @override
  Widget build(BuildContext context) {
    final a = Provider.of<AuthProvider>(context, listen: false);
    if (a.isAuthenticated) {
      final r = a.user?['role']?.toString().toUpperCase();
      WidgetsBinding.instance.addPostFrameCallback((_) => Navigator.pushReplacementNamed(context, r == 'PRODUCTEUR' ? '/producer' : r == 'COLLECTEUR' ? '/collector' : '/login'));
    }

    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      body: SafeArea(
        child: Column(children: [
          Expanded(
            child: PageView.builder(
              controller: _page,
              onPageChanged: (i) => setState(() => _idx = i),
              itemCount: _steps.length + 1,
              itemBuilder: (_, i) => i == 0 ? _intro() : _stepView(_steps[i - 1]),
            ),
          ),
          _dots(),
          Padding(padding: const EdgeInsets.fromLTRB(24, 4, 24, 32), child: _idx == 0 ? _startButtons() : _nextButton()),
        ]),
      ),
    );
  }

  Widget _intro() => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: const Icon(Icons.recycling, size: 56, color: AppTheme.brand),
          ),
          const SizedBox(height: 28),
          Text('Vos déchets ont\nde la valeur.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w700, color: AppTheme.textPrimary, height: 1.1)),
          const SizedBox(height: 14),
          Text('Triez, publiez, et recevez des récompenses pour certains déchets triés.',
              textAlign: TextAlign.center,
              style: GoogleFonts.manrope(fontSize: 16, color: AppTheme.textSoft, height: 1.5)),
        ]),
      );

  Widget _stepView(_Step s) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(24)),
            child: Icon(s.icon, size: 48, color: AppTheme.brand),
          ),
          const SizedBox(height: 28),
          Text(s.title, textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w700, color: AppTheme.textPrimary, height: 1.15)),
          const SizedBox(height: 14),
          Text(s.body, textAlign: TextAlign.center,
              style: GoogleFonts.manrope(fontSize: 16, color: AppTheme.textSoft, height: 1.55)),
        ]),
      );

  Widget _startButtons() => Column(children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => _page.nextPage(duration: const Duration(milliseconds: 400), curve: Curves.easeOutCubic),
            child: const Text('Commencer'),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(onPressed: _go, child: const Text("J'ai déjà un compte")),
      ]);

  Widget _nextButton() => SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: _idx == _steps.length ? _go : () => _page.nextPage(duration: const Duration(milliseconds: 400), curve: Curves.easeOutCubic),
          child: Text(_idx == _steps.length ? "C'est parti" : 'Continuer'),
        ),
      );

  Widget _dots() => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(_steps.length + 1, (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: i == _idx ? 24 : 8,
              height: 8,
              decoration: BoxDecoration(color: i == _idx ? AppTheme.brand : AppTheme.inkLow, borderRadius: BorderRadius.circular(999)),
            )),
      );
}

class _Step {
  final IconData icon; final String title; final String body;
  const _Step(this.icon, this.title, this.body);
}
