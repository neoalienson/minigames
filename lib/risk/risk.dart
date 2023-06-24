import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'risk_combat.dart';
import 'risk_roll.dart';
import 'dart:async';

class Vs extends StatelessWidget {
  const Vs({
    Key? key,
    required this.att,
    required this.def
  }) : super(key: key);

  final int att;
  final int def;

  @override
  Widget build(BuildContext context) {
    final ButtonStyle style =
    ElevatedButton.styleFrom(textStyle: const TextStyle(fontSize: 20));
    List<Widget> list = [], list1 = [], list2 = [];

    for (int i = 0; i < att; i++) {
      list1.add(const Padding(
        padding: EdgeInsets.all(8),
        child: FaIcon(FontAwesomeIcons.handFist)));
    }
    list.add(Expanded(child: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: list1, 
      )));
    list.add(const FaIcon(FontAwesomeIcons.bolt));
    for (int i = 0; i < def; i++) {
      list2.add(const Padding(
        padding: EdgeInsets.all(8),
        child: FaIcon(FontAwesomeIcons.shieldHalved)));      
    }    
    list.add(Expanded(child: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: list2, 
      )));

    return ElevatedButton(
        style: style,
        onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => RiskDiceResult(att:att, def:def)),
            );
        },
        child: Row(children: list)
    );
  }
}


class RiskDiceSelection extends StatelessWidget {
  const RiskDiceSelection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Risk'),
      ),
      body: GridView.count(
        primary: false,
        padding: const EdgeInsets.all(12),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        crossAxisCount: 1,
        childAspectRatio: 6,
        children: const <Widget> [
            Vs(att: 3, def: 2),
            Vs(att: 3, def: 1),
            Vs(att: 2, def: 2),
            Vs(att: 2, def: 1),
            Vs(att: 1, def: 2),
            Vs(att: 1, def: 1),
          ]
        ),
    );
  }
}

class RiskDiceResult extends StatefulWidget {
  final int att;
  final int def;

  const RiskDiceResult({
    Key? key,
    required this.att, 
    required this.def,
  }) : super(key: key);

  // ignore: library_private_types_in_public_api
  @override _RiskDiceResultState createState() => _RiskDiceResultState();
}

class _RiskDiceResultState extends State<RiskDiceResult> {
  final List<FaIcon> _diceIcons = [
    const FaIcon(FontAwesomeIcons.diceOne),
    const FaIcon(FontAwesomeIcons.diceTwo),
    const FaIcon(FontAwesomeIcons.diceThree),
    const FaIcon(FontAwesomeIcons.diceFour),
    const FaIcon(FontAwesomeIcons.diceFive),
    const FaIcon(FontAwesomeIcons.diceSix),
  ];
  final FaIcon _dizzy = const FaIcon(FontAwesomeIcons.dizzy);
  final Text _empty = const Text('');
  var _dices = RiskDices();
  var _resolution = RiskResolution();
  bool _rolling = true;
  Timer? _rollTimer;

  @override
  void initState() {
    _rollAndResolve();
    super.initState();
  }

  @override
  void dispose() {
    _rollTimer?.cancel();
    super.dispose();
  }

  void _rollAndResolve() {
    _rollTimer = Timer(const Duration(seconds: 1), () {
      _rollTimer?.cancel();
      setState(() {
        _rolling = false;
      });
    });

    setState(() {
      _rolling = true;
      _dices = RiskDices();
      _dices.roll(widget.att, widget.def);
      _resolution = RiskCombat.resolve(_dices.atts, _dices.defs);
    });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      appBar: AppBar(
        title: const Text('Risk Dices Result'),
      ),
      body: _rolling ? const Rolling() :
        GridView.count(
        padding: const EdgeInsets.all(12),
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        crossAxisCount: 2,
        childAspectRatio: 2,
        children: <Widget> [
            const Text('Attack'),
            const Text('Defend'),
            Row(children: <Widget> [ 
              _diceIcons[_dices.atts[0]],
              _resolution.atts[0] ? _dizzy : _empty
            ]),
            Row(children: <Widget> [ 
             _diceIcons[_dices.defs[0]],
             _resolution.defs[0] ? _dizzy : _empty
            ]),
            (widget.att > 1) ? Row(children: <Widget> [ 
              _diceIcons[_dices.atts[1]],
              _resolution.atts[1] ? _dizzy : _empty
             ]) : _empty,
            (widget.def > 1) ? Row(children: <Widget> [ 
              _diceIcons[_dices.defs[1]],
              _resolution.defs[1] ? _dizzy : _empty
             ]) : _empty,
            (widget.att > 2) ? Row(children: <Widget> [ 
              _diceIcons[_dices.atts[2]],
              _resolution.atts[2] ? _dizzy : _empty
             ]) : _empty,
            _empty,
          ]
        ),
      floatingActionButton: FloatingActionButton(
        onPressed: () { _rollAndResolve(); },
        tooltip: 'Dices again',
        child: const Icon(Icons.refresh_rounded)
      ),
    );
  }
}