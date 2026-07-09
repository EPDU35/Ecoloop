import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../core/api_service.dart';

class AuthProvider with ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _loading = false;
  String? _errorMessage;

  Map<String, dynamic>? get user => _user;
  bool get loading => _loading;
  String? get errorMessage => _errorMessage;

  bool get isAuthenticated => _user != null;

  Future<bool> loadProfile() async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/users/me');
      if (response.statusCode == 200) {
        _user = jsonDecode(response.body);
        _loading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      _errorMessage = e.toString();
    }

    _user = null;
    _loading = false;
    notifyListeners();
    return false;
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await ApiService.saveTokens(data['access_token'], data['refresh_token']);
        final success = await loadProfile();
        return success;
      } else {
        _errorMessage = _formatError(response);
      }
    } catch (e) {
      _errorMessage = 'Impossible de se connecter au serveur.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }

  Future<AuthResult> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required String role,
  }) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/register', {
        'full_name': fullName,
        'email': email,
        'phone': phone,
        'password': password,
        'role': role,
      });

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        // En mode dev, le backend renvoie le code OTP pour test (jamais en prod).
        final devOtp = data is Map ? data['dev_otp']?.toString() : null;
        _loading = false;
        notifyListeners();
        return AuthResult(success: true, devOtp: devOtp);
      } else {
        _errorMessage = _formatError(response);
      }
    } catch (e) {
      _errorMessage = 'Impossible de se connecter au serveur.';
    }

    _loading = false;
    notifyListeners();
    return AuthResult(success: false);
  }

  Future<bool> verifyOtp(String email, String code) async {
    _loading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.post('/auth/verify-otp', {
        'email': email,
        'code': code,
      });

      if (response.statusCode == 200) {
        _loading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = _formatError(response);
      }
    } catch (e) {
      _errorMessage = 'Erreur réseau lors de la validation.';
    }

    _loading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await ApiService.clearTokens();
    _user = null;
    notifyListeners();
  }

  /// Formate le corps d'erreur du backend (string, dict, ou liste de 422 Pydantic).
  String _formatError(http.Response response) {
    try {
      final data = jsonDecode(response.body);
      final detail = data['detail'];
      if (detail is String) {
        return detail;
      }
      if (detail is List) {
        // Erreurs de validation Pydantic : on extrait les messages 'msg'.
        final messages = detail
            .whereType<Map<String, dynamic>>()
            .map((e) => e['msg']?.toString() ?? '')
            .where((m) => m.isNotEmpty)
            .toList();
        if (messages.isNotEmpty) return messages.join('\n');
      }
      if (detail is Map) {
        return detail.toString();
      }
    } catch (_) {
      // ignore : on tombe sur le message par défaut ci-dessous
    }
    return 'Erreur lors de la requête (code ${response.statusCode}).';
  }
}

/// Résultat de l'inscription : succès et éventuel code OTP de développement.
class AuthResult {
  final bool success;
  final String? devOtp;
  AuthResult({required this.success, this.devOtp});
}
