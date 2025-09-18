import 'dart:math';
import 'package:flutter/material.dart';

class DiceRoller extends StatefulWidget {
  const DiceRoller({super.key});

  @override
  DiceRollerState createState() => DiceRollerState();
}

@visibleForTesting
class DiceRollerState extends State<DiceRoller> {
  late List<int> dices;

  DiceRollerState() {
    dices = rollDice();
  }

  void _rollDice() {
    setState(() {
      dices = rollDice();
    });
  }

  List<int> rollDice() {
    final random = Random();
    return List.generate(3, (_) => random.nextInt(6) + 1);
  }

  bool isDouble(List<int> diceResults) {
    return diceResults.toSet().length == 2;
  }

  bool isTriple(List<int> diceResults) {
    return diceResults.toSet().length == 1;
  }

  int getMostRepeated(List<int> list) {
    final folded = list.fold<Map<int, int>>({}, (p, c) => p..update(c, (v) => v + 1, ifAbsent: () => 1));
    final reduced = folded.entries.reduce((a, b) => a.value > b.value ? a : b).key;
    return reduced;
  }

  String _getRollMessage(List<int> diceResults) {
    if (isDouble(diceResults)) {
      return "Double ${getMostRepeated(diceResults)}!";
    }
    if (isTriple(diceResults)) {
      return "Triple ${getMostRepeated(diceResults)}!";
    }    
    return "";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dice Roller'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(3, (i) => _buildDice(dices[i])),
            ),
            const SizedBox(height: 32),
            Text(
              'Sum: ${dices.reduce((value, element) => value + element)}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            Text(
              _getRollMessage(dices),
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),     
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _rollDice,
              child: const Text('Roll Dice'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDice(int value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        '$value',
        style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
      ),
    );
  }
}