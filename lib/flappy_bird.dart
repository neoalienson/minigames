import 'dart:async';
import 'package:flutter/material.dart';

class ImageClipper extends CustomClipper<Rect> {
  final Rect cropRect;

  ImageClipper({required this.cropRect});

  @override
  Rect getClip(Size size) {
    return cropRect;
  }

  @override
  bool shouldReclip(ImageClipper oldClipper) {
    return oldClipper.cropRect != cropRect;
  }
}

//   Widget _buildSprite(double left, double top, double width, double height, String asset) {
//     return Transform.translate(
//   offset: Offset(0, 0),
//   child: ClipRect(
//     clipper: ImageClipper(
//       cropRect: Rect.fromLTWH(left, top, width, height),
//     ),
//     child: Align(
//       alignment: Alignment.topLeft,
//       child: Image.asset(
//         asset,
//         width: 433,
//         height: 260,
//         fit: BoxFit.none,
//       ),
//     ),
//   ),
// );
//   }

// child: _buildSprite(0, 0, 145, 255, 'assets/flappy_bird.png'),
// child: _buildSprite(380, 186, 25, 25, 'assets/flappy_bird.png'),
//   child: _buildSprite(150, 0, 30, 165, 'assets/flappy_bird.png'),

void main() => runApp(FlappyBirdGame());

class FlappyBirdGame extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flappy Bird Game',
      home: FlappyBirdScreen(),
    );
  }
}

class FlappyBirdScreen extends StatefulWidget {
  @override
  _FlappyBirdScreenState createState() => _FlappyBirdScreenState();
}

class _FlappyBirdScreenState extends State<FlappyBirdScreen> {
  static const double groundHeight = 100.0;
  static const double groundSpeed = 2.0;

  double groundX = 0.0;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    startGame();
  }

  void startGame() {
    groundX = 0.0;
    timer?.cancel();
    timer = Timer.periodic(Duration(milliseconds: 16), (timer) {
      updateGameState();
    });
  }

  void updateGameState() {
    setState(() {
      groundX -= groundSpeed;
      if (groundX <= -600) {
        groundX = 0.0;
      }
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          AnimatedPositioned(
            duration: Duration(milliseconds: 16),
            left: groundX,
            child: Image.asset('assets/flappy_bird.png', height: groundHeight,),
          ),
        ],
      ),
    );
  }
}