import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'auth_provider.dart';
import '../theme/app_theme.dart';
import '../shared/ui_components.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({Key? key}) : super(key: key);

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  Timer? _timer;
  int _resendIn = 0;
  bool _canResend = false;

  String? _email;
  String? _devOtp;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)!.settings.arguments;
    _email = args is Map ? args['email'] as String? ?? '' : args as String? ?? '';
    _devOtp = args is Map ? args['devOtp'] as String? : null;
    if (_resendIn == 0) _startTimer();
  }

  void _startTimer() {
    setState(() {
      _resendIn = 45;
      _canResend = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_resendIn <= 1) {
        t.cancel();
        setState(() {
          _resendIn = 0;
          _canResend = true;
        });
      } else {
        setState(() => _resendIn--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    if (!_formKey.currentState!.validate()) return;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.verifyOtp(_email ?? '', _otpController.text.trim());
    if (success) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Compte activé avec succès ! Connectez-vous.'),
          backgroundColor: AppTheme.brand,
        ),
      );
      Navigator.pushReplacementNamed(context, '/login');
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Code incorrect.'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.ink900,
      appBar: AppBar(
        title: const Text('Code de confirmation'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.brand.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.sms_outlined, size: 40, color: AppTheme.brand),
                ),
                const SizedBox(height: 22),
                Text(
                  'Vérifions votre numéro',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 24, fontWeight: FontWeight.w700, color: AppTheme.textStrong,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Nous envoyons un code pour protéger votre compte et vous prévenir quand le collecteur arrive.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textSoft, fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 28),
                TextFormField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 28, letterSpacing: 12, fontWeight: FontWeight.w700,
                    color: AppTheme.textStrong,
                  ),
                  decoration: InputDecoration(
                    hintText: '123456',
                    counterText: '',
                    filled: true,
                    fillColor: AppTheme.ink800,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusInput),
                      borderSide: const BorderSide(color: AppTheme.ink700),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusInput),
                      borderSide: const BorderSide(color: AppTheme.brand, width: 1.5),
                    ),
                  ),
                  validator: (v) => v == null || v.length != 6 ? 'Saisissez le code à 6 chiffres' : null,
                ),
                if (_devOtp != null && _devOtp!.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.warn.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.warn.withValues(alpha: 0.3)),
                    ),
                    child: Text(
                      'MODE DEV : votre code est $_devOtp',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppTheme.warn, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                EcoUI.primaryButton(
                  label: 'Valider mon compte',
                  loading: authProvider.loading,
                  onPressed: _handleVerify,
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Code non reçu ? ', style: TextStyle(color: AppTheme.textSoft)),
                    GestureDetector(
                      onTap: _canResend
                          ? () {
                              // Renvoi (le backend renverra un nouveau code en prod).
                              _startTimer();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Un nouveau code a été envoyé.'),
                                  backgroundColor: AppTheme.brand,
                                ),
                              );
                            }
                          : null,
                      child: Text(
                        _canResend
                            ? 'Renvoyer le code'
                            : 'Renvoyer dans $_resendIn s',
                        style: TextStyle(
                          color: _canResend ? AppTheme.brand : AppTheme.textFaint,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(context, '/register'),
                    child: const Text(
                      'Modifier mon numéro',
                      style: TextStyle(color: AppTheme.textSoft, fontWeight: FontWeight.w600),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
