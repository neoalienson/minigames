import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class SpinWheelWidget extends StatefulWidget {
  final List<String> items;

  const SpinWheelWidget({super.key, required this.items});

  @override
  @visibleForTesting
  SpinWheelWidgetState createState() => SpinWheelWidgetState();
}

class SpinWheelWidgetState extends State<SpinWheelWidget> 
    with SingleTickerProviderStateMixin{
  String _resultText = '';
  int index = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.green, width: 2),
          ),
          child: Stack(
            children: [
              ..._buildSlices(),
              Align(
                alignment: Alignment.center,
                child: Container(
                  width: 50,
                  height: 50,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _startSpin,
          child: const Text('Spin'),
        ),
        const SizedBox(height: 20),
        Text(_resultText),
      ],
    );
  }

  List<Widget> _buildSlices() {
    final sliceAngle = 2 * pi / widget.items.length;
    return List.generate(
      widget.items.length,
      (idx) => Transform.rotate(
        angle: idx * sliceAngle,
        child: Container(
          width: 200,
          height: 200,
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Text(
              widget.items[idx],
              style: const TextStyle(fontSize: 20, color: Colors.amber),
            ),
          ),
        ),
      ),
    );
  }

  void _startSpin() {
    final random = Random();
    const totalDuration = Duration(seconds: 3);
    final startAngle = random.nextDouble() * 2 * pi;
    final endAngle = startAngle + 10 * pi + random.nextDouble() * 2 * pi;
    const curve = Curves.decelerate;
    final angleController = AnimationController(
      vsync: this,
      duration: totalDuration,
    )..addListener(() {
        setState(() {
          const value = 0.0;
          final angle = startAngle + curve.transform(value) * (endAngle - startAngle);
          _rotateWheel(angle);
        });
      });
    angleController.forward();
    Timer(totalDuration, () {
      angleController.stop();
      final selectedItemIndex = _getSelectedItemIndex(startAngle, endAngle);
      setState(() {
        _resultText = widget.items[selectedItemIndex];
      });
    });
  }

  void _rotateWheel(double angle) {
    setState(() {
      // TODO: Rotate the wheel to the given angle
    });
  }

  int _getSelectedItemIndex(double startAngle, double endAngle) {
    final sliceAngle = 2 * pi / widget.items.length;
    final adjustedStartAngle = startAngle % (2 * pi);
    final adjustedEndAngle = endAngle % (2 * pi);
    final startSliceIndex = (adjustedStartAngle / sliceAngle).floor();
    final endSliceIndex = (adjustedEndAngle / sliceAngle).floor();
    if (startSliceIndex == endSliceIndex) {
      return startSliceIndex;
    } else {
      final selectedItemIndex = endSliceIndex % widget.items.length;
      return selectedItemIndex;
    }
  }
}