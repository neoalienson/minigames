import 'package:flutter/material.dart';
import 'tictactoe.dart';

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
          // Add more games to the list here
        ],
      ),
    );
  }
}