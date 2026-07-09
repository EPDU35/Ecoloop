import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'collector_provider.dart';
import '../theme/app_theme.dart';
import '../shared/ui_components.dart';
import '../core/animation_helper.dart';

class ValidateOtpScreen extends StatefulWidget {
  const ValidateOtpScreen({Key? key}) : super(key: key);
  @override
  State<ValidateOtpScreen> createState() => _ValidateOtpScreenState();
}

class _ValidateOtpScreenState extends State<ValidateOtpScreen> {
  final _codeC = TextEditingController();
  final _weightC = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() { _codeC.dispose(); _weightC.dispose(); super.dispose(); }

  Future<void> _handleValidate() async {
    if (!_formKey.currentState!.validate()) return;
    final cp = Provider.of<CollectorProvider>(context, listen: false);
    final collectionId = cp.activeCollection?['id']?.toString() ?? '';
    if (collectionId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Aucune collecte active.'), backgroundColor: AppTheme.error),
      );
      return;
    }
    final ok = await cp.validateCollection(
      collectionId,
      _codeC.text.trim(),
      double.parse(_weightC.text.trim()),
    );
    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Collecte validée avec succès !'), backgroundColor: AppTheme.brand, behavior: SnackBarBehavior.floating),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(cp.errorMessage ?? 'Code OTP incorrect.'), backgroundColor: AppTheme.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cp = Provider.of<CollectorProvider>(context);
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Valider la collecte')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: AnimationHelper.staggeredList(children: [
              const Icon(Icons.check_circle_outline, size: 56, color: AppTheme.brand),
              const SizedBox(height: 20),
              Text("Valider la collecte", textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 8),
              const Text("Saisissez le code OTP du producteur et le poids réel.", textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textSoft, fontSize: 14)),
              const SizedBox(height: 28),
              TextFormField(controller: _codeC, keyboardType: TextInputType.number, maxLength: 6, textAlign: TextAlign.center,
                style: GoogleFonts.outfit(fontSize: 28, letterSpacing: 12, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Code OTP', counterText: '',
                    hintText: '123456'),
                validator: (v) => v == null || v.length != 6 ? 'Code à 6 chiffres' : null),
              const SizedBox(height: 16),
              TextFormField(controller: _weightC, keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Poids réel (kg)', prefixIcon: Icon(Icons.scale_outlined, color: AppTheme.textFaint)),
                validator: (v) => v == null || double.tryParse(v) == null || double.parse(v) <= 0 ? 'Poids invalide' : null),
              const SizedBox(height: 28),
              EcoUI.primaryButton(label: 'Valider la collecte', loading: cp.loading, icon: Icons.check, onPressed: _handleValidate),
            ]),
          ),
        ),
      ),
    );
  }
}
