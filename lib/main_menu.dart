import 'package:flutter/material.dart';
import 'tictactoe.dart';
import 'tictactoe3x4.dart';
import 'flappy_bird.dart';
import 'shikaku_menu.dart';


class MainMenuPage extends StatefulWidget {
  @override
  _MainMenuPageState createState() => _MainMenuPageState();
}

class _MainMenuPageState extends State<MainMenuPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Game Menu'),
      ),
      body: ListView(
        children: [
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TicTacToePage()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Tic Tac Toe'),
              subtitle: Text('A classic game of Xs and Os'),
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TicTacToe3x4Page()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Tic Tac Toe 3 players in 4 x 4'),
              subtitle: Text('A modified game in 4 x 4 Grid for 3 players'),
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => ShikakuGameMenu()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Shikaku'),
              subtitle: Text('Shikaku'),
            ),
          ),                  

        ],
      ),
    );
  }
}