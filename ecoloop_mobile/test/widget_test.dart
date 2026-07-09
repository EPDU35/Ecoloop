import 'package:flutter_test/flutter_test.dart';
import 'package:ecoloop_mobile/main.dart';

void main() {
  testWidgets('App launches', (WidgetTester tester) async {
    await tester.pumpWidget(const EcoLoopApp());
    expect(find.text('Commencer'), findsOneWidget);
  });
}
