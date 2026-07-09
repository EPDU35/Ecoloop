class TransactionModel {
  final String id;
  final String collectionId;
  final String producerId;
  final String collectorId;
  final double grossAmount;
  final double commissionAmount;
  final double netAmount;
  final String paymentMethod;
  final String status;
  final String createdAt;
  final String? paidAt;

  TransactionModel({
    required this.id,
    required this.collectionId,
    required this.producerId,
    required this.collectorId,
    required this.grossAmount,
    required this.commissionAmount,
    required this.netAmount,
    required this.paymentMethod,
    required this.status,
    required this.createdAt,
    this.paidAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id'] ?? '',
      collectionId: json['collection_id'] ?? '',
      producerId: json['producer_id'] ?? '',
      collectorId: json['collector_id'] ?? '',
      grossAmount: (json['gross_amount'] ?? 0).toDouble(),
      commissionAmount: (json['commission_amount'] ?? 0).toDouble(),
      netAmount: (json['net_amount'] ?? 0).toDouble(),
      paymentMethod: json['payment_method'] ?? '',
      status: json['status'] ?? '',
      createdAt: json['created_at'] ?? '',
      paidAt: json['paid_at'],
    );
  }
}
