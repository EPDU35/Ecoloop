import 'dart:convert';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static final String baseUrl = () {
    const defined = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (defined.isNotEmpty) return defined;
    return kIsWeb ? 'http://localhost:8000/api/v1' : 'http://10.0.2.2:8000/api/v1';
  }();

  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _storage.read(key: 'access_token');
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await _storage.read(key: 'access_token');
    return {
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> get(String endpoint) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return http.get(uri, headers: headers);
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return http.post(uri, headers: headers, body: jsonEncode(body));
  }

  static Future<http.Response> patch(String endpoint, Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return http.patch(uri, headers: headers, body: jsonEncode(body));
  }

  static Future<http.Response> delete(String endpoint) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    return http.delete(uri, headers: headers);
  }

  static Future<http.Response> uploadFile(String endpoint, String filePath, String fieldName) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final headers = await getAuthHeaders();

    final request = http.MultipartRequest('POST', uri);
    request.headers.addAll(headers);
    request.files.add(await http.MultipartFile.fromPath(fieldName, filePath));

    final streamed = await request.send();
    return http.Response.fromStream(streamed);
  }

  static Future<void> saveTokens(String access, String refresh) async {
    await _storage.write(key: 'access_token', value: access);
    await _storage.write(key: 'refresh_token', value: refresh);
  }

  static Future<void> clearTokens() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  static Future<bool> hasToken() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }
}
