import 'package:flutter/material.dart';

class AnimationHelper {
  static Widget fadeIn({
    required Widget child,
    int delayMs = 0,
    Duration duration = const Duration(milliseconds: 500),
  }) {
    return _DelayedFadeIn(child: child, delayMs: delayMs, duration: duration);
  }

  static Widget slideUp({
    required Widget child,
    int delayMs = 0,
    Duration duration = const Duration(milliseconds: 500),
  }) {
    return _DelayedSlideUp(child: child, delayMs: delayMs, duration: duration);
  }

  static Widget scaleIn({
    required Widget child,
    int delayMs = 0,
    Duration duration = const Duration(milliseconds: 400),
  }) {
    return _DelayedScaleIn(child: child, delayMs: delayMs, duration: duration);
  }

  static Widget staggeredList({
    required List<Widget> children,
    int baseDelay = 100,
  }) {
    return Column(
      children: children.asMap().entries.map((e) {
        return _DelayedSlideUp(
          child: e.value,
          delayMs: e.key * baseDelay,
          duration: const Duration(milliseconds: 400),
        );
      }).toList(),
    );
  }

  static PageRouteBuilder pageTransition(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (context, animation, secondaryAnimation) => page,
      transitionsBuilder: (context, animation, secondaryAnimation, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.05, 0),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
          child: FadeTransition(
            opacity: Tween<double>(begin: 0, end: 1).animate(animation),
            child: child,
          ),
        );
      },
      transitionDuration: const Duration(milliseconds: 300),
    );
  }
}

class _DelayedFadeIn extends StatefulWidget {
  final Widget child;
  final int delayMs;
  final Duration duration;
  const _DelayedFadeIn({required this.child, required this.delayMs, required this.duration});
  @override
  State<_DelayedFadeIn> createState() => _DelayedFadeInState();
}

class _DelayedFadeInState extends State<_DelayedFadeIn> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    Future.delayed(Duration(milliseconds: widget.delayMs), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _animation, child: widget.child);
  }
}

class _DelayedSlideUp extends StatefulWidget {
  final Widget child;
  final int delayMs;
  final Duration duration;
  const _DelayedSlideUp({required this.child, required this.delayMs, required this.duration});
  @override
  State<_DelayedSlideUp> createState() => _DelayedSlideUpState();
}

class _DelayedSlideUpState extends State<_DelayedSlideUp> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slide;
  late Animation<double> _fade;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _slide = Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    Future.delayed(Duration(milliseconds: widget.delayMs), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fade,
      child: SlideTransition(position: _slide, child: widget.child),
    );
  }
}

class _DelayedScaleIn extends StatefulWidget {
  final Widget child;
  final int delayMs;
  final Duration duration;
  const _DelayedScaleIn({required this.child, required this.delayMs, required this.duration});
  @override
  State<_DelayedScaleIn> createState() => _DelayedScaleInState();
}

class _DelayedScaleInState extends State<_DelayedScaleIn> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.elasticOut);
    Future.delayed(Duration(milliseconds: widget.delayMs), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(scale: _animation, child: widget.child);
  }
}
