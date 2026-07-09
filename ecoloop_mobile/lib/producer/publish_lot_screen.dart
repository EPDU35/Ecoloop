import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'producer_provider.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';
import '../core/image_service.dart';
import '../core/location_service.dart';
import '../core/animation_helper.dart';

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
  XFile? _image;
  double? _lat;
  double? _lon;
  String? _address;
  bool _locating = false;
  bool _classifying = false;
  Map<String, dynamic>? _classifyResult;

  final _categories = ['PLASTIQUE', 'CARTON', 'METAL', 'VERRE', 'ORGANIQUE', 'ELECTRONIQUE', 'AUTRE'];

  @override
  void initState() {
    super.initState();
    _autoLocate();
  }

  @override
  void dispose() { _weightC.dispose(); _descC.dispose(); super.dispose(); }

  Future<void> _autoLocate() async {
    setState(() => _locating = true);
    final pos = await LocationService.getCurrentLocation();
    if (pos != null && mounted) {
      setState(() { _lat = pos.latitude; _lon = pos.longitude; });
      final addr = await LocationService.getAddressFromCoords(pos.latitude, pos.longitude);
      if (mounted) setState(() => _address = addr);
    }
    if (mounted) setState(() => _locating = false);
  }

  Future<void> _pickImage({required bool camera}) async {
    final img = camera
        ? await ImageService.pickFromCamera()
        : await ImageService.pickFromGallery();
    if (img != null && mounted) {
      setState(() { _image = img; _classifyResult = null; });
      _classifyImage(img);
    }
  }

  Future<void> _classifyImage(XFile img) async {
    setState(() => _classifying = true);
    final result = await ImageService.classifyWaste(img);
    if (result != null && mounted) {
      setState(() {
        _classifyResult = result;
        _classifying = false;
        if (result['categorie'] != null) {
          final cat = result['categorie'].toString().toUpperCase();
          if (_categories.contains(cat)) _category = cat;
        }
      });
    } else {
      if (mounted) setState(() => _classifying = false);
    }
  }

  void _showImagePicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.inkHigh,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.rCard)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.inkLow, borderRadius: BorderRadius.circular(999))),
          const SizedBox(height: 20),
          Text("Ajouter une photo", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
          const SizedBox(height: 20),
          ListTile(
            leading: const Icon(Icons.camera_alt_outlined, color: AppTheme.brand),
            title: const Text('Prendre une photo', style: TextStyle(color: AppTheme.textPrimary)),
            onTap: () { Navigator.pop(ctx); _pickImage(camera: true); },
          ),
          ListTile(
            leading: const Icon(Icons.photo_library_outlined, color: AppTheme.info),
            title: const Text('Choisir depuis la galerie', style: TextStyle(color: AppTheme.textPrimary)),
            onTap: () { Navigator.pop(ctx); _pickImage(camera: false); },
          ),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  Future<void> _handlePublish() async {
    if (!_formKey.currentState!.validate()) return;
    final provider = Provider.of<ProducerProvider>(context, listen: false);
    final success = await provider.publishLot(
      category: _category,
      weight: double.parse(_weightC.text),
      pricePerKg: 0,
      description: _descC.text.trim(),
      lat: _lat ?? 5.3484,
      lon: _lon ?? -3.9806,
    );
    if (!mounted) return;
    if (success) {
      if (_image != null && provider.lastPublishedLotId != null) {
        await ImageService.uploadPhoto(provider.lastPublishedLotId!, _image!);
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Lot publié avec succès !'),
          backgroundColor: AppTheme.brand,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.errorMessage ?? 'Erreur lors de la publication.'), backgroundColor: AppTheme.error),
      );
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
            child: AnimationHelper.staggeredList(children: [
              Text("Décrivez ce que vous avez à jeter", style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textPrimary)),
              const SizedBox(height: 6),
              const Text("Un collecteur viendra le récupérer chez vous.", style: TextStyle(color: AppTheme.textSoft, fontSize: 14)),
              const SizedBox(height: 24),

              // Image picker
              GestureDetector(
                onTap: _showImagePicker,
                child: Container(
                  height: 180,
                  decoration: BoxDecoration(
                    color: AppTheme.inkMid,
                    borderRadius: BorderRadius.circular(AppTheme.rCard),
                    border: Border.all(color: AppTheme.borderMed, width: 1.5),
                  ),
                  child: _image == null
                      ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(_classifying ? Icons.hourglass_top : Icons.camera_alt_outlined, size: 40, color: AppTheme.textFaint),
                          const SizedBox(height: 8),
                          Text(_classifying ? "Analyse IA en cours..." : "Ajouter une photo",
                              style: const TextStyle(color: AppTheme.textSoft, fontSize: 14)),
                          if (_classifying) ...[
                            const SizedBox(height: 8),
                            const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand)),
                          ],
                        ])
                      : Stack(fit: StackFit.expand, children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(AppTheme.rCard - 2),
                            child: Image.file(File(_image!.path), fit: BoxFit.cover),
                          ),
                          if (_classifyResult != null)
                            Positioned(
                              top: 8, left: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.brand.withValues(alpha: 0.9),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  _classifyResult!['categorie'] ?? 'Détecté',
                                  style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ),
                          if (_classifyResult != null && _classifyResult!['tips'] != null && (_classifyResult!['tips'] as List).isNotEmpty)
                            Positioned(
                              bottom: 8, left: 8, right: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: AppTheme.inkFull.withValues(alpha: 0.85),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  (_classifyResult!['tips'] as List).first.toString(),
                                  style: const TextStyle(color: AppTheme.textSoft, fontSize: 11),
                                  maxLines: 2, overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                          Positioned(
                            top: 8, right: 8,
                            child: GestureDetector(
                              onTap: () => setState(() { _image = null; _classifyResult = null; }),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                                child: const Icon(Icons.close, size: 18, color: Colors.white),
                              ),
                            ),
                          ),
                        ]),
                ),
              ),
              const SizedBox(height: 20),

              // Category
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
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
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

              // Weight
              TextFormField(controller: _weightC, keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: 'Poids estimé (kg)', prefixIcon: Icon(Icons.scale_outlined, color: AppTheme.textFaint)),
                validator: (v) => v == null || double.tryParse(v) == null ? 'Poids invalide' : null),
              const SizedBox(height: 14),

              // Description
              TextFormField(controller: _descC, maxLines: 2,
                decoration: const InputDecoration(hintText: 'Description (optionnelle)', prefixIcon: Icon(Icons.description_outlined, color: AppTheme.textFaint))),
              const SizedBox(height: 14),

              // Location
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.inkHigh,
                  borderRadius: BorderRadius.circular(AppTheme.rCard),
                  border: Border.all(color: AppTheme.borderMed),
                ),
                child: Row(children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: (_lat != null ? AppTheme.brand : AppTheme.warn).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: _locating
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand))
                        : Icon(_lat != null ? Icons.near_me : Icons.location_off, size: 20,
                            color: _lat != null ? AppTheme.brand : AppTheme.warn),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _locating ? "Localisation en cours..." :
                      _address ?? (_lat != null ? "Position acquise" : "Géolocalisation non disponible"),
                      style: TextStyle(color: _lat != null ? AppTheme.textSoft : AppTheme.textFaint, fontSize: 13),
                    ),
                  ),
                  if (_lat == null && !_locating)
                    GestureDetector(
                      onTap: _autoLocate,
                      child: const Icon(Icons.refresh, size: 20, color: AppTheme.brand),
                    ),
                ]),
              ),
              const SizedBox(height: 28),

              // Submit
              EcoUI.primaryButton(label: "Publier mon lot", loading: p.loading, icon: Icons.arrow_forward, onPressed: _handlePublish),
            ]),
          ),
        ),
      ),
    );
  }
}
