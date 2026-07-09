class CollectionModel {
  final String id;
  final String wasteLotId;
  final String collectorId;
  final String status;
  final double? actualWeightKg;
  final String reservedAt;
  final String? validatedAt;

  CollectionModel({
    required this.id,
    required this.wasteLotId,
    required this.collectorId,
    required this.status,
    this.actualWeightKg,
    required this.reservedAt,
    this.validatedAt,
  });

  factory CollectionModel.fromJson(Map<String, dynamic> json) {
    return CollectionModel(
      id: json['id'] ?? '',
      wasteLotId: json['waste_lot_id'] ?? '',
      collectorId: json['collector_id'] ?? '',
      status: json['status'] ?? '',
      actualWeightKg: json['actual_weight_kg']?.toDouble(),
      reservedAt: json['reserved_at'] ?? '',
      validatedAt: json['validated_at'],
    );
  }
}
