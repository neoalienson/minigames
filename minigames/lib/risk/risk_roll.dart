import 'package:flutter/material.dart';
import 'package:rive/rive.dart';

class Rolling extends StatelessWidget {
  const Rolling({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: RiveAnimation.asset('assets/poison-loader.riv')
      ),
    );
  }
}
