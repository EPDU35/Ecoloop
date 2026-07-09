import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:convert';
import '../core/api_service.dart';
import '../shared/ui_components.dart';
import '../theme/app_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifs = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.get('/notifications');
      if (res.statusCode == 200) _notifs = jsonDecode(res.body);
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _markRead(String id) async {
    await ApiService.patch('/notifications/$id/read', {});
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.inkFull,
      appBar: AppBar(title: const Text('Notifications')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
          : _notifs.isEmpty
              ? EcoUI.emptyState(icon: Icons.notifications_none_outlined, title: "Aucune notification", subtitle: "Les alertes de collecte apparaîtront ici.")
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _notifs.length,
                    itemBuilder: (ctx, i) {
                      final n = _notifs[i];
                      final read = n['is_read'] == true;
                      return Dismissible(
                        key: Key(n['id']?.toString() ?? i.toString()),
                        direction: DismissDirection.endToStart,
                        onDismissed: (_) => _markRead(n['id']),
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(color: AppTheme.inkMid, borderRadius: BorderRadius.circular(AppTheme.rCard)),
                          child: const Icon(Icons.check, color: AppTheme.brand),
                        ),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: read ? AppTheme.inkHigh : AppTheme.inkMid,
                            borderRadius: BorderRadius.circular(AppTheme.rCard),
                            border: Border.all(color: read ? AppTheme.borderMed : AppTheme.brand.withValues(alpha: 0.2)),
                          ),
                          child: Row(children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: (read ? AppTheme.textFaint : AppTheme.brand).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(read ? Icons.notifications_none : Icons.notifications_active, size: 20,
                                  color: read ? AppTheme.textFaint : AppTheme.brand),
                            ),
                            const SizedBox(width: 14),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(n['title'] ?? '', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: read ? AppTheme.textSoft : AppTheme.textPrimary)),
                              if (n['content'] != null) ...[const SizedBox(height: 2), Text(n['content'], style: const TextStyle(fontSize: 12, color: AppTheme.textFaint))],
                            ])),
                            if (!read) Container(width: 8, height: 8, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.brand)),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
