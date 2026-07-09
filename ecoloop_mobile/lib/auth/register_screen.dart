import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'auth_provider.dart';
import '../theme/app_theme.dart';
import '../shared/ui_components.dart';
import '../core/animation_helper.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({Key? key}) : super(key: key);

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _districtController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _selectedRole = 'PRODUCTEUR';
  final Map<String, Map<String, dynamic>> _roles = {
    'PRODUCTEUR': {
      'label': 'Je produis des déchets',
      'sub': 'Ménage, restaurant, boutique, école',
      'icon': Icons.home_outlined,
    },
    'COLLECTEUR': {
      'label': 'Je suis collecteur',
      'sub': 'Personne ou structure qui récupère',
      'icon': Icons.emoji_transportation_outlined,
    },
    'ORGANISATION': {
      'label': 'Je représente une organisation',
      'sub': 'Mairie, entreprise, association',
      'icon': Icons.apartment_outlined,
    },
  };

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _districtController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    final phone = _phoneController.text.trim();
    final email = '${phone.replaceAll(RegExp(r'[^0-9]'), '')}@ecoloop.local';
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final result = await authProvider.register(
      fullName: _fullNameController.text.trim(),
      email: email,
      phone: phone,
      password: _passwordController.text.trim(),
      role: _selectedRole,
    );

    if (result.success) {
      if (!mounted) return;
      Navigator.pushReplacementNamed(
        context,
        '/otp',
        arguments: {'email': email, 'devOtp': result.devOtp},
      );
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Inscription impossible pour le moment.'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  InputDecoration _dec(String hint, IconData icon) => InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: AppTheme.textFaint),
      );

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppTheme.ink900,
      appBar: AppBar(
        title: const Text('Créer un compte'),
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
                AnimationHelper.fadeIn(
                  child: Text('Quel est votre profil ?',
                    style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textStrong),),
                ),
                const SizedBox(height: 6),
                const Text('Cela nous aide à vous proposer la bonne expérience.',
                    style: TextStyle(color: AppTheme.textSoft, fontSize: 14)),
                const SizedBox(height: 18),
                ..._roles.entries.map((e) {
                  final selected = _selectedRole == e.key;
                  return AnimationHelper.fadeIn(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedRole = e.key),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: selected ? AppTheme.brand.withValues(alpha: 0.12) : AppTheme.ink800,
                            borderRadius: BorderRadius.circular(AppTheme.radiusCard),
                            border: Border.all(
                              color: selected ? AppTheme.brand : AppTheme.ink700,
                              width: selected ? 1.5 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(e.value['icon'] as IconData,
                                  color: selected ? AppTheme.brand : AppTheme.textSoft, size: 26),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(e.value['label'] as String,
                                        style: const TextStyle(
                                            color: AppTheme.textStrong, fontWeight: FontWeight.w600, fontSize: 15)),
                                    const SizedBox(height: 2),
                                    Text(e.value['sub'] as String,
                                        style: const TextStyle(color: AppTheme.textSoft, fontSize: 13)),
                                  ],
                                ),
                              ),
                              if (selected)
                                const Icon(Icons.check_circle, color: AppTheme.brand, size: 22),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 16),
                AnimationHelper.slideUp(
                  child: TextFormField(
                    controller: _fullNameController,
                    decoration: _dec('Nom ou prénom', Icons.person_outline),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Indiquez votre nom' : null,
                  ),
                ),
                const SizedBox(height: 14),
                AnimationHelper.slideUp(
                  child: TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: _dec('Numéro de téléphone', Icons.phone_outlined),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Indiquez votre numéro';
                      if (v.trim().length < 8) return 'Numéro trop court';
                      return null;
                    },
                  ),
                ),
                const SizedBox(height: 14),
                AnimationHelper.slideUp(
                  child: TextFormField(
                    controller: _districtController,
                    decoration: _dec('Quartier', Icons.location_on_outlined),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Indiquez votre quartier' : null,
                  ),
                ),
                const SizedBox(height: 14),
                AnimationHelper.slideUp(
                  child: TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: _dec('Mot de passe', Icons.lock_outline),
                    validator: (v) {
                      if (v == null || v.length < 10) return 'Au moins 10 caractères';
                      if (!v.contains(RegExp(r'[A-Z]'))) return 'Au moins une majuscule';
                      if (!v.contains(RegExp(r'[a-z]'))) return 'Au moins une minuscule';
                      if (!v.contains(RegExp(r'[0-9]'))) return 'Au moins un chiffre';
                      return null;
                    },
                  ),
                ),
                const SizedBox(height: 24),
                EcoUI.primaryButton(
                  label: 'Créer mon compte',
                  loading: authProvider.loading,
                  icon: Icons.arrow_forward,
                  onPressed: _handleRegister,
                ),
                const SizedBox(height: 14),
                Center(
                  child: GestureDetector(
                    onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                    child: const Text(
                      'Déjà un compte ? Se connecter',
                      style: TextStyle(color: AppTheme.brand, fontWeight: FontWeight.w600),
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
