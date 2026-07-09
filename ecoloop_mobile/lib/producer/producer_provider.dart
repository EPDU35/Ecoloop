import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_service.dart';

class ProducerProvider with ChangeNotifier {
  Map<String, dynamic>? _rewards;
  Map<String, dynamic>? _dashboard;
  List<dynamic> _myLots = [];
  List<dynamic> _pointsHistory = [];
  List<dynamic> _notifications = [];
  Map<String, dynamic>? _pricePredictions;
  bool _loading = false;
  String? _errorMessage;
  String? _lastPublishedLotId;

  Map<String, dynamic>? get rewards => _rewards;
  Map<String, dynamic>? get dashboard => _dashboard;
  List<dynamic> get myLots => _myLots;
  List<dynamic> get pointsHistory => _pointsHistory;
  List<dynamic> get notifications => _notifications;
  Map<String, dynamic>? get pricePredictions => _pricePredictions;
  bool get loading => _loading;
  String? get errorMessage => _errorMessage;
  String? get lastPublishedLotId => _lastPublishedLotId;

  Future<void> fetchData() async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final dashResponse = await ApiService.get('/dashboard/producer');
      if (dashResponse.statusCode == 200) {
        _dashboard = jsonDecode(dashResponse.body);
        _pricePredictions = _dashboard?['price_predictions'];
      }

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

      final notifResponse = await ApiService.get('/notifications');
      if (notifResponse.statusCode == 200) {
        _notifications = jsonDecode(notifResponse.body);
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
    _lastPublishedLotId = null;
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
        final data = jsonDecode(response.body);
        _lastPublishedLotId = data['id']?.toString();
        await fetchData();
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
