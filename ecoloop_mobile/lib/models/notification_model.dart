class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String content;
  final String type;
  final String? entityType;
  final String? entityId;
  final bool isRead;
  final String? readAt;
  final String createdAt;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.content,
    required this.type,
    this.entityType,
    this.entityId,
    required this.isRead,
    this.readAt,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      type: json['type'] ?? '',
      entityType: json['entity_type'],
      entityId: json['entity_id'],
      isRead: json['is_read'] ?? false,
      readAt: json['read_at'],
      createdAt: json['created_at'] ?? '',
    );
  }
}
