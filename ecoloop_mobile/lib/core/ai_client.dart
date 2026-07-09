import 'dart:convert';
import 'api_service.dart';

class AIClient {
  static Future<Map<String, dynamic>?> getHealth() async {
    try {
      final res = await ApiService.get('/ai/health');
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }

  static Future<Map<String, dynamic>?> getPriceSuggestion(String category) async {
    try {
      final res = await ApiService.get('/price-suggestion?category=$category');
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }

  static Future<Map<String, dynamic>?> classifyImage(String filePath) async {
    try {
      final res = await ApiService.uploadFile('/ai/classify', filePath, 'file');
      if (res.statusCode == 200) return jsonDecode(res.body);
    } catch (_) {}
    return null;
  }

  static Future<List<dynamic>?> getCategories() async {
    try {
      final res = await ApiService.get('/ai/classify/categories');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        return data['categories'] as List<dynamic>?;
      }
    } catch (_) {}
    return null;
  }
}
