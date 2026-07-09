import 'package:flutter/foundation.dart' show kIsWeb;
import 'api_service.dart';

class PushService {
  static Future<bool> registerDeviceToken(String token, {String? platform}) async {
    try {
      final response = await ApiService.post('/push/register', {
        'token': token,
        'platform': platform ?? (kIsWeb ? 'web' : 'mobile'),
      });
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> unregisterDeviceToken(String token) async {
    try {
      final response = await ApiService.post('/push/unregister', {
        'token': token,
      });
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
