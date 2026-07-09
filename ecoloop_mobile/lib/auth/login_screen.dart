import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'auth_provider.dart';
import '../theme/app_theme.dart';
import '../core/animation_helper.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _loginC = TextEditingController(), _passC = TextEditingController();
  final _key = GlobalKey<FormState>();

  @override
  void dispose() { _loginC.dispose(); _passC.dispose(); super.dispose(); }

  String _normalize(String v) {
    final t = v.trim();
    if (RegExp(r'^[0-9+\s]+$').hasMatch(t) && t.replaceAll(RegExp(r'[^0-9]'), '').length >= 8) {
      return '${t.replaceAll(RegExp(r'[^0-9]'), '')}@ecoloop.local';
    }
    return t;
  }

  Future<void> _go() async {
    if (!_key.currentState!.validate()) return;
    final a = Provider.of<AuthProvider>(context, listen: false);
    final ok = await a.login(_normalize(_loginC.text), _passC.text);
    if (!mounted) return;
    if (ok) {
      final r = a.user!['role']?.toString().toUpperCase();
      if (r == 'PRODUCTEUR') { Navigator.pushReplacementNamed(context, '/producer'); return; }
      if (r == 'COLLECTEUR') { Navigator.pushReplacementNamed(context, '/collector'); return; }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Rôle non géré.')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(a.errorMessage ?? 'Identifiants incorrects.'), backgroundColor: AppTheme.error));
    }
  }

  @override
  Widget build(BuildContext context) {
    final a = Provider.of<AuthProvider>(context);
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      body: SafeArea(child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _key,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const SizedBox(height: 24),
            AnimationHelper.scaleIn(
              child: Container(padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                child: const Icon(Icons.recycling, size: 40, color: AppTheme.brand)),
            ),
            const SizedBox(height: 22),
            AnimationHelper.fadeIn(
              delayMs: 200,
              child: Text("Bon retour !", style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
            ),
            const SizedBox(height: 8),
            AnimationHelper.fadeIn(
              delayMs: 300,
              child: const Text("Connectez-vous pour suivre vos collectes.", style: TextStyle(color: AppTheme.textSoft, fontSize: 14)),
            ),
            const SizedBox(height: 32),
            AnimationHelper.slideUp(
              delayMs: 200,
              child: TextFormField(controller: _loginC, keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(hintText: 'Email ou téléphone', prefixIcon: Icon(Icons.person_outline, color: AppTheme.textFaint)),
                validator: (v) => v == null || v.trim().isEmpty ? 'Identifiant requis' : null),
            ),
            const SizedBox(height: 14),
            AnimationHelper.slideUp(
              delayMs: 300,
              child: TextFormField(controller: _passC, obscureText: true,
                decoration: const InputDecoration(hintText: 'Mot de passe', prefixIcon: Icon(Icons.lock_outline, color: AppTheme.textFaint)),
                validator: (v) => v == null || v.isEmpty ? 'Mot de passe requis' : null),
            ),
            const SizedBox(height: 24),
            AnimationHelper.slideUp(
              delayMs: 400,
              child: SizedBox(width: double.infinity, child: ElevatedButton(
                onPressed: a.loading ? null : _go,
                child: a.loading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.black)))
                    : const Text('Se connecter'))),
            ),
            const SizedBox(height: 18),
            AnimationHelper.fadeIn(
              delayMs: 500,
              child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Text("Nouveau sur EcoLoop ? ", style: TextStyle(color: AppTheme.textSoft)),
                GestureDetector(onTap: () => Navigator.pushNamed(context, '/register'),
                    child: const Text("Créer un compte", style: TextStyle(color: AppTheme.brand, fontWeight: FontWeight.w700))),
              ]),
            ),
          ]),
        ),
      )),
    );
  }
}
