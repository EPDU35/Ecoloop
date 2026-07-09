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
import 'theme/app_theme.dart';

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
      routes: {
        '/': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/otp': (context) => const OtpScreen(),
        '/producer': (context) => const ProducerDashboard(),
        '/producer/publish': (context) => const PublishLotScreen(),
        '/producer/history': (context) => const ProducerHistoryScreen(),
        '/collector': (context) => const CollectorDashboard(),
        '/collector/validate': (context) => const ValidateOtpScreen(),
        '/collector/collections': (context) => const MyCollectionsScreen(),
        '/notifications': (context) => const NotificationsScreen(),
        '/wallet': (context) => const WalletScreen(),
        '/rewards': (context) => const RewardsScreen(),
        '/profile': (context) => const ProfileScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/collector/lot-detail') {
          final lot = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(builder: (_) => LotDetailScreen(lot: lot));
        }
        return null;
      },
    );
  }
}
