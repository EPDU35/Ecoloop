import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_service.dart';

class ProducerProvider with ChangeNotifier {
  Map<String, dynamic>? _rewards;
  List<dynamic> _myLots = [];
  List<dynamic> _pointsHistory = [];
  bool _loading = false;
  String? _errorMessage;

  Map<String, dynamic>? get rewards => _rewards;
  List<dynamic> get myLots => _myLots;
  List<dynamic> get pointsHistory => _pointsHistory;
  bool get loading => _loading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchData() async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final rewardsResponse = await ApiService.get('/rewards/me');
      if (rewardsResponse.statusCode == 200) {
        _rewards = jsonDecode(rewardsResponse.body);
      }

      final lotsResponse = await ApiService.get('/my-wastes');
      if (lotsResponse.statusCode == 200) {
        _myLots = jsonDecode(lotsResponse.body);
      }

      final historyResponse = await ApiService.get('/rewards/history');
      if (historyResponse.statusCode == 200) {
        _pointsHistory = jsonDecode(historyResponse.body);
      }
    } catch (e) {
      _errorMessage = 'Erreur lors de la récupération des données.';
    }

    _loading = false;
    notifyListeners();
  }

  Future<bool> publishLot({
    required String category,
    required double weight,
    required double pricePerKg,
    required String description,
    required double lat,
    required double lon,
  }) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/wastes', {
        'category': category,
        'weight_kg': weight,
        'price_per_kg': pricePerKg,
        'description': description,
        'latitude': lat,
        'longitude': lon,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchData(); // Refresh data
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        _errorMessage = errorData['detail'] ?? 'Erreur lors de la publication.';
      }
    } catch (e) {
      _errorMessage = 'Impossible de publier le lot.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }
}
