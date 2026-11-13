import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';
import 'models.dart';

class SessionController extends ChangeNotifier {
  SessionController(this.api, this.preferences);

  final PayPulseApi api;
  final SharedPreferences preferences;

  static const _tokenKey = 'paypulse_flutter_token_v1';
  static const _userKey = 'paypulse_flutter_user_v1';

  PayPulseUser? user;
  bool isBusy = false;

  Future<void> restore() async {
    final token = preferences.getString(_tokenKey);
    final storedUser = preferences.getString(_userKey);
    if (token == null || storedUser == null) return;
    try {
      api.token = token;
      user = PayPulseUser.fromJson(Map<String, dynamic>.from(jsonDecode(storedUser) as Map));
    } catch (_) {
      await logout();
    }
  }

  Future<void> signIn(String email, String password) async {
    await _run(() async {
      final response = await api.login(email, password);
      await _saveSession(response);
    });
  }

  Future<void> switchRole(String role) async {
    await _run(() async {
      final response = await api.switchRole(role);
      await _saveSession(response);
    });
  }

  Future<void> _saveSession(Map<String, dynamic> response) async {
    final nextToken = response['token']?.toString();
    final nextUser = response['user'];
    if (nextToken == null || nextUser is! Map) {
      throw const ApiException('PayPulse returned an invalid sign-in response.');
    }
    api.token = nextToken;
    user = PayPulseUser.fromJson(Map<String, dynamic>.from(nextUser));
    await preferences.setString(_tokenKey, nextToken);
    await preferences.setString(_userKey, jsonEncode(user!.toJson()));
  }

  Future<void> _run(Future<void> Function() operation) async {
    isBusy = true;
    notifyListeners();
    try {
      await operation();
    } finally {
      isBusy = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    user = null;
    api.token = null;
    await preferences.remove(_tokenKey);
    await preferences.remove(_userKey);
    notifyListeners();
  }
}
