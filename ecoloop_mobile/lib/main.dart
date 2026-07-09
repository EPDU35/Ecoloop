import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'auth/auth_provider.dart';
import 'auth/login_screen.dart';
import 'auth/register_screen.dart';
import 'auth/otp_screen.dart';
import 'producer/producer_provider.dart';
import 'producer/producer_dashboard.dart';
import 'producer/publish_lot_screen.dart';
import 'producer/screens/history_screen.dart';
import 'collector/collector_provider.dart';
import 'collector/collector_dashboard.dart';
import 'collector/validate_otp_screen.dart';
import 'collector/screens/lot_detail_screen.dart';
import 'collector/screens/my_collections_screen.dart';
import 'core/splash_screen.dart';
import 'shared/notifications_screen.dart';
import 'shared/wallet_screen.dart';
import 'shared/rewards_screen.dart';
import 'shared/profile_screen.dart';
import 'shared/price_chart_screen.dart';
import 'theme/app_theme.dart';
import 'core/animation_helper.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProducerProvider()),
        ChangeNotifierProvider(create: (_) => CollectorProvider()),
      ],
      child: const EcoLoopApp(),
    ),
  );
}

class EcoLoopApp extends StatelessWidget {
  const EcoLoopApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EcoLoop',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: '/',
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/':
            return AnimationHelper.pageTransition(const SplashScreen());
          case '/login':
            return AnimationHelper.pageTransition(const LoginScreen());
          case '/register':
            return AnimationHelper.pageTransition(const RegisterScreen());
          case '/otp':
            return AnimationHelper.pageTransition(const OtpScreen());
          case '/producer':
            return AnimationHelper.pageTransition(const ProducerDashboard());
          case '/producer/publish':
            return AnimationHelper.pageTransition(const PublishLotScreen());
          case '/producer/history':
            return AnimationHelper.pageTransition(const ProducerHistoryScreen());
          case '/collector':
            return AnimationHelper.pageTransition(const CollectorDashboard());
          case '/collector/validate':
            return AnimationHelper.pageTransition(const ValidateOtpScreen());
          case '/collector/collections':
            return AnimationHelper.pageTransition(const MyCollectionsScreen());
          case '/collector/lot-detail':
            final lot = settings.arguments as Map<String, dynamic>;
            return AnimationHelper.pageTransition(LotDetailScreen(lot: lot));
          case '/notifications':
            return AnimationHelper.pageTransition(const NotificationsScreen());
          case '/wallet':
            return AnimationHelper.pageTransition(const WalletScreen());
          case '/rewards':
            return AnimationHelper.pageTransition(const RewardsScreen());
          case '/profile':
            return AnimationHelper.pageTransition(const ProfileScreen());
          case '/price-chart':
            final category = settings.arguments as String? ?? 'PLASTIQUE';
            return AnimationHelper.pageTransition(PriceChartScreen(category: category));
          default:
            return null;
        }
      },
    );
  }
}
