import 'dart:convert';
import 'package:flutter/material.dart';
import '../core/api_service.dart';

class CollectorProvider with ChangeNotifier {
  List<dynamic> _availableLots = [];
  List<dynamic> _notifications = [];
  List<dynamic> _collections = [];
  Map<String, dynamic>? _activeCollection;
  bool _loading = false;
  String? _errorMessage;

  List<dynamic> get availableLots => _availableLots;
  List<dynamic> get notifications => _notifications;
  List<dynamic> get collections => _collections;
  Map<String, dynamic>? get activeCollection => _activeCollection;
  bool get loading => _loading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchData() async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final lotsResponse = await ApiService.get('/available-wastes');
      if (lotsResponse.statusCode == 200) {
        _availableLots = jsonDecode(lotsResponse.body);
      }

      final notifResponse = await ApiService.get('/notifications');
      if (notifResponse.statusCode == 200) {
        _notifications = jsonDecode(notifResponse.body);
      }

      final collectionResponse = await ApiService.get('/transaction/history');
      if (collectionResponse.statusCode == 200) {
        _collections = jsonDecode(collectionResponse.body);
      }
    } catch (e) {
      _errorMessage = 'Erreur lors du chargement des données.';
    }

    _loading = false;
    notifyListeners();
  }

  Future<bool> updateGps(double lat, double lon) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/users/gps', {
        'latitude': lat,
        'longitude': lon,
        'accuracy_meters': 10.0,
      });

      if (response.statusCode == 200) {
        _loading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = 'Impossible de mettre à jour le GPS.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }

  Future<bool> reserveLot(String lotId) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/reserve', {
        'waste_lot_id': lotId,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        _activeCollection = jsonDecode(response.body);
        await fetchData();
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        _errorMessage = errorData['detail'] ?? 'Erreur lors de la réservation.';
      }
    } catch (e) {
      _errorMessage = 'Le lot n\'est plus disponible.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }

  Future<bool> validateCollection(String collectionId, String code, double actualWeight) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/validate-collection/$collectionId', {
        'validation_code': code,
        'actual_weight_kg': actualWeight,
      });

      if (response.statusCode == 200) {
        _activeCollection = null;
        await fetchData();
        return true;
      } else {
        final errorData = jsonDecode(response.body);
        _errorMessage = errorData['detail'] ?? 'Code OTP incorrect.';
      }
    } catch (e) {
      _errorMessage = 'Erreur lors de la validation.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }
}
