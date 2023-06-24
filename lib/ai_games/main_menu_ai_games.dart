import 'package:flutter/material.dart';
import 'tictactoe.dart';
import 'tictactoe3x4.dart';
import 'shikaku_menu.dart';
import 'hamster_race.dart';
import 'whack_a_mole.dart';

class AIGamesMenuPage extends StatefulWidget {
  const AIGamesMenuPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _AIGamesMenuState createState() => _AIGamesMenuState();
}

class MenuItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget Function(BuildContext) function;

  MenuItem(this.icon, this.title, this.subtitle, this.function);  
}

class _AIGamesMenuState extends State<AIGamesMenuPage> {

  @override
  Widget build(BuildContext context) {
    var widgets = <Widget>[];
    final menu = <MenuItem>[
        MenuItem(Icons.gamepad, 'Tic Tac Toe', 'A classic game of Xs and Os', 
          (context) => const TicTacToePage()),
        MenuItem(Icons.gamepad, 'Tic Tac Toe 3 players in 4 x 4', 'A modified game in 4 x 4 Grid for 3 players', 
          (context) => const TicTacToe3x4Page()),
        MenuItem(Icons.gamepad, 'Shikaku', 'Shikaku',
          (context) => const ShikakuGameMenu()),
        MenuItem(Icons.gamepad, 'Hamster Race', '',
          (context) => const HamsterRaceScreen()),
        MenuItem(Icons.gamepad, 'Whack a Hamster', '',
          (context) => const WhackAMoleGame()),
      ];

    for (var i in menu) {
      widgets.add(
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: i.function),
              );
            },
            child: ListTile(
              leading: Icon(i.icon),
              title: Text(i.title),
              subtitle: Text(i.subtitle),
            ),
          ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Game Menu'),
      ),
      body: ListView(
        children: widgets,
      ),
    );
  }
}