import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiException implements Exception {
  const ApiException(this.message);
  final String message;

  @override
  String toString() => message;
}

class PayPulseApi {
  PayPulseApi({http.Client? client}) : _client = client ?? http.Client();

  static const _defaultBaseUrl = 'https://paypulse-api-three.vercel.app/api';
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: _defaultBaseUrl,
  );

  final http.Client _client;
  String? token;

  Uri _uri(String path, [Map<String, String>? query]) {
    final root = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return Uri.parse('$root$path').replace(queryParameters: query);
  }

  Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? query,
  }) async {
    final request = http.Request(method, _uri(path, query));
    request.headers['Content-Type'] = 'application/json';
    if (token != null && token!.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    if (body != null) request.body = jsonEncode(body);

    try {
      final streamed = await _client.send(request).timeout(const Duration(seconds: 15));
      final response = await http.Response.fromStream(streamed);
      final decoded = response.body.isEmpty
          ? <String, dynamic>{}
          : Map<String, dynamic>.from(jsonDecode(response.body) as Map);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiException(decoded['message']?.toString() ?? 'Request failed (${response.statusCode}).');
      }
      return decoded;
    } on ApiException {
      rethrow;
    } catch (_) {
      throw const ApiException('Could not reach PayPulse. Check your connection and try again.');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) =>
      _request('POST', '/auth/login', body: {'email': email.trim(), 'password': password});

  Future<Map<String, dynamic>> switchRole(String role) =>
      _request('POST', '/auth/demo-switch', body: {'role': role});

  Future<Map<String, dynamic>> wageSummary() async {
    final response = await _request('GET', '/ewa/summary');
    return Map<String, dynamic>.from(response['data'] as Map? ?? {});
  }

  Future<List<Map<String, dynamic>>> expenses({String? status, String? category}) async {
    final query = <String, String>{};
    if (status != null && status != 'ALL') query['status'] = status;
    if (category != null && category != 'ALL') query['category'] = category;
    final response = await _request('GET', '/expenses', query: query.isEmpty ? null : query);
    return (response['claims'] as List? ?? [])
        .map((item) => Map<String, dynamic>.from(item as Map))
        .toList();
  }

  Future<Map<String, dynamic>> requestAdvance({
    required double amount,
    required String transferType,
    String? note,
  }) =>
      _request('POST', '/ewa/request-advance', body: {
        'amount': amount,
        'transferType': transferType,
        'note': note,
      });

  Future<Map<String, dynamic>> submitExpense({
    required String title,
    required String category,
    required double amount,
    required String merchant,
    String? receiptUrl,
  }) =>
      _request('POST', '/expenses', body: {
        'title': title,
        'category': category,
        'amount': amount,
        'merchant': merchant,
        'receiptUrl': receiptUrl,
      });

  Future<Map<String, dynamic>> reviewExpense(
    String id,
    String decision, {
    String? notes,
  }) =>
      _request('PATCH', '/expenses/$id/review', body: {
        'decision': decision,
        'notes': notes,
      });

  void close() => _client.close();
}
