import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:http_parser/http_parser.dart';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class ImageService {
  static final _picker = ImagePicker();

  static Future<XFile?> pickFromCamera() async {
    return _picker.pickImage(source: ImageSource.camera, imageQuality: 85, maxWidth: 1024);
  }

  static Future<XFile?> pickFromGallery() async {
    return _picker.pickImage(source: ImageSource.gallery, imageQuality: 85, maxWidth: 1024);
  }

  static Future<Map<String, dynamic>?> uploadPhoto(String lotId, XFile image) async {
    try {
      final uri = Uri.parse('${ApiService.baseUrl}/wastes/$lotId/photo');
      final headers = await ApiService.getAuthHeaders();
      headers.remove('Content-Type');

      final request = http.MultipartRequest('POST', uri);
      request.headers.addAll(headers);
      request.files.add(await http.MultipartFile.fromPath(
        'file',
        image.path,
        contentType: MediaType('image', image.path.endsWith('.png') ? 'png' : 'jpeg'),
      ));

      final streamed = await request.send();
      final response = await http.Response.fromStream(streamed);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return null;
  }

  static Future<Map<String, dynamic>?> classifyWaste(XFile image) async {
    try {
      final uri = Uri.parse('${ApiService.baseUrl}/ai/classify');
      final headers = await ApiService.getAuthHeaders();
      headers.remove('Content-Type');

      final request = http.MultipartRequest('POST', uri);
      request.headers.addAll(headers);
      request.files.add(await http.MultipartFile.fromPath(
        'file',
        image.path,
        contentType: MediaType('image', image.path.endsWith('.png') ? 'png' : 'jpeg'),
      ));

      final streamed = await request.send();
      final response = await http.Response.fromStream(streamed);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return null;
  }
}
