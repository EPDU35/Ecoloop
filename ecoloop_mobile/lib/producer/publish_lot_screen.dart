import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'producer_provider.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';

class PublishLotScreen extends StatefulWidget {
  const PublishLotScreen({Key? key}) : super(key: key);
  @override
  State<PublishLotScreen> createState() => _PublishLotScreenState();
}

class _PublishLotScreenState extends State<PublishLotScreen> {
  final _formKey = GlobalKey<FormState>();
  final _weightC = TextEditingController(text: '5');
  final _descC = TextEditingController();
  String _category = 'PLASTIQUE';

  final _categories = ['PLASTIQUE', 'CARTON', 'METAL', 'VERRE', 'ORGANIQUE', 'ELECTRONIQUE', 'AUTRE'];

  @override
  void dispose() { _weightC.dispose(); _descC.dispose(); super.dispose(); }

  Future<void> _handlePublish() async {
    if (!_formKey.currentState!.validate()) return;
    final provider = Provider.of<ProducerProvider>(context, listen: false);
    final success = await provider.publishLot(
      category: _category,
      weight: double.parse(_weightC.text),
      pricePerKg: 0,
      description: _descC.text.trim(),
      lat: 5.3484,
      lon: -3.9806,
    );
    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lot publié avec succès !'), backgroundColor: AppTheme.brand));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.errorMessage ?? 'Erreur lors de la publication.'), backgroundColor: AppTheme.error));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = Provider.of<ProducerProvider>(context);
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Publier mes déchets')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Text("Décrivez ce que vous avez à jeter", style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 6),
              const Text("Un collecteur viendra le récupérer chez vous.", style: TextStyle(color: AppTheme.textSoft, fontSize: 14)),
              const SizedBox(height: 24),
              const Text("Catégorie", style: TextStyle(color: AppTheme.textSoft, fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: _categories.map((c) {
                  final sel = _category == c;
                  return Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: GestureDetector(
                      onTap: () => setState(() => _category = c),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        decoration: BoxDecoration(
                          color: sel ? AppTheme.brand.withValues(alpha: 0.12) : AppTheme.inkMid,
                          borderRadius: BorderRadius.circular(AppTheme.rPill),
                          border: Border.all(color: sel ? AppTheme.brand : AppTheme.inkLow),
                        ),
                        child: Text(c[0] + c.substring(1).toLowerCase(),
                            style: TextStyle(color: sel ? AppTheme.brand : AppTheme.textSoft, fontWeight: FontWeight.w600, fontSize: 13)),
                      ),
                    ),
                  );
                }).toList()),
              ),
              const SizedBox(height: 20),
              TextFormField(controller: _weightC, keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: 'Poids estimé (kg)', prefixIcon: Icon(Icons.scale_outlined, color: AppTheme.textFaint)),
                validator: (v) => v == null || double.tryParse(v) == null ? 'Poids invalide' : null),
              const SizedBox(height: 14),
              TextFormField(controller: _descC, maxLines: 2,
                decoration: const InputDecoration(hintText: 'Description (optionnelle)', prefixIcon: Icon(Icons.description_outlined, color: AppTheme.textFaint))),
              const SizedBox(height: 14),
              EcoUI.surfaceCard(
                child: Row(children: [
                  Container(padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppTheme.info.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.near_me, size: 20, color: AppTheme.info)),
                  const SizedBox(width: 12),
                  const Expanded(child: Text("La géolocalisation sera récupérée automatiquement.", style: TextStyle(color: AppTheme.textSoft, fontSize: 13))),
                ]),
              ),
              const SizedBox(height: 32),
              EcoUI.primaryButton(label: "Publier mon lot", loading: p.loading, icon: Icons.arrow_forward, onPressed: _handlePublish),
            ]),
          ),
        ),
      ),
    );
  }
}
