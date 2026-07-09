import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'collector_provider.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';

class ValidateOtpScreen extends StatefulWidget {
  const ValidateOtpScreen({Key? key}) : super(key: key);
  @override
  State<ValidateOtpScreen> createState() => _ValidateOtpScreenState();
}

class _ValidateOtpScreenState extends State<ValidateOtpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpC = TextEditingController();
  final _weightC = TextEditingController();

  @override
  void dispose() { _otpC.dispose(); _weightC.dispose(); super.dispose(); }

  Future<void> _handleValidate() async {
    if (!_formKey.currentState!.validate()) return;
    final provider = Provider.of<CollectorProvider>(context, listen: false);
    final active = provider.activeCollection;
    if (active == null) return;
    final ok = await provider.validateCollection(
      active['id'],
      _otpC.text.trim(),
      double.parse(_weightC.text.isNotEmpty ? _weightC.text : active['estimated_weight_kg'].toString()),
    );
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Collecte validée !'), backgroundColor: AppTheme.brand));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.errorMessage ?? 'Code OTP incorrect.'), backgroundColor: AppTheme.error));
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CollectorProvider>(context);
    final active = provider.activeCollection;

    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Valider la collecte')),
      body: active == null
          ? const Center(child: Text("Aucune collecte active.", style: TextStyle(color: AppTheme.textSoft)))
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                    Container(padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(color: AppTheme.brand.withValues(alpha: 0.1), shape: BoxShape.circle),
                      child: const Icon(Icons.verified_user_outlined, size: 48, color: AppTheme.brand)),
                    const SizedBox(height: 22),
                    Text("Pesée & validation", textAlign: TextAlign.center,
                        style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
                    const SizedBox(height: 8),
                    const Text("Demandez le code OTP au producteur et pesez les déchets réellement récupérés.",
                        textAlign: TextAlign.center, style: TextStyle(color: AppTheme.textSoft, fontSize: 14, height: 1.5)),
                    const SizedBox(height: 28),
                    TextFormField(controller: _otpC, keyboardType: TextInputType.number, maxLength: 6,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(fontSize: 28, letterSpacing: 12, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                      decoration: const InputDecoration(hintText: '123456', counterText: ''),
                      validator: (v) => v == null || v.length != 6 ? 'Code à 6 chiffres requis' : null),
                    const SizedBox(height: 16),
                    TextFormField(controller: _weightC, keyboardType: TextInputType.number,
                      decoration: InputDecoration(hintText: 'Poids réel pesé (kg) — optionnel',
                          prefixIcon: const Icon(Icons.scale_outlined, color: AppTheme.textFaint)),
                      validator: (v) => v != null && v.isNotEmpty && double.tryParse(v) == null ? 'Poids invalide' : null),
                    const SizedBox(height: 24),
                    EcoUI.primaryButton(label: "Valider la collecte", loading: provider.loading, onPressed: _handleValidate),
                  ]),
                ),
              ),
            ),
    );
  }
}
