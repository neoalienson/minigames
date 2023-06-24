import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';

class WhackAMoleGame extends StatefulWidget {
  const WhackAMoleGame({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _WhackAMoleGameState createState() => _WhackAMoleGameState();
}

class _WhackAMoleGameState extends State<WhackAMoleGame> {
  int _score = 0;

  late Timer _timer;
  final List<bool> _isVisibleList = List.generate(10, (_) => false);

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _stopTimer();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      final randomIndex = Random().nextInt(10);
      setState(() {
        _isVisibleList[randomIndex] = !_isVisibleList[randomIndex];
      });
    });
  }

  void _stopTimer() {
    _timer.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Whack-a-Mole Game'),
      ),
      body: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Score: $_score'),
            Expanded(
            child: GridView.count(
              crossAxisCount: 5,
              children: List.generate(10, (index) => HamsterHole(index, _isVisibleList, _onHamsterWhacked)),
              ),
            ),
          ],
        ),
    );
  }

  void _onHamsterWhacked(int index) {
    if (_isVisibleList[index]) {
      setState(() {
        _score++;
        _isVisibleList[index] = false;
        _playWhackSound();
      });
    }
  }

  Future<void> _playWhackSound() async {
    // final player = AudioCache();
    // await player.play('whack.mp3');
  }
}

class HamsterHole extends StatelessWidget {
  final int index;
  final List<bool> isVisibleList;
  final Function(int) onWhacked;

  const HamsterHole(this.index, this.isVisibleList, this.onWhacked, {super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onWhacked(index),
      child: Container(
        margin: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isVisibleList[index] ? Colors.yellow : Colors.grey,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: isVisibleList[index] ? Image.asset('images/hamster1.png') : null,
        ),
      ),
    );
  }
}
