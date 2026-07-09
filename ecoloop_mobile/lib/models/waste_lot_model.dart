class WasteLotModel {
  final String id;
  final String producerId;
  final String? collectorId;
  final String category;
  final String? description;
  final double weightKg;
  final double pricePerKg;
  final String? photoUrl;
  final double latitude;
  final double longitude;
  final String status;
  final String createdAt;

  WasteLotModel({
    required this.id,
    required this.producerId,
    this.collectorId,
    required this.category,
    this.description,
    required this.weightKg,
    required this.pricePerKg,
    this.photoUrl,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.createdAt,
  });

  factory WasteLotModel.fromJson(Map<String, dynamic> json) {
    return WasteLotModel(
      id: json['id'] ?? '',
      producerId: json['producer_id'] ?? '',
      collectorId: json['collector_id'],
      category: json['category'] ?? '',
      description: json['description'],
      weightKg: (json['weight_kg'] ?? 0).toDouble(),
      pricePerKg: (json['price_per_kg'] ?? 0).toDouble(),
      photoUrl: json['photo_url'],
      latitude: (json['latitude'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? 0).toDouble(),
      status: json['status'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }

  double get totalPrice => weightKg * pricePerKg;
}
