class UserModel {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final String role;
  final bool isActive;
  final bool isVerified;
  final String createdAt;

  UserModel({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.role,
    required this.isActive,
    required this.isVerified,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      fullName: json['full_name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role']?.toString().toUpperCase() ?? '',
      isActive: json['is_active'] ?? true,
      isVerified: json['is_verified'] ?? false,
      createdAt: json['created_at'] ?? '',
    );
  }
}
