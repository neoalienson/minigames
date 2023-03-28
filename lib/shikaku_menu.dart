import 'package:flutter/material.dart';
import 'shikaku.dart';


class ShikakuGameMenu extends StatefulWidget {
  @override
  _ShikakuGameMenuState createState() => _ShikakuGameMenuState();
}

class _ShikakuGameMenuState extends State<ShikakuGameMenu> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('List of Shikaku Game'),
      ),
      body: ListView(
        children: [
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ShikakuGame(numbers: [
                  4, 0, 0, 0,
                  4, 0, 0, 0,
                  4, 0, 0, 0,
                  4, 0, 0, 0,
                  ])),
              );
            },
            child: const ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Game 1'),
              subtitle: Text('A very simple game'),
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ShikakuGame(numbers: [
                  4, 0, 3, 0, 0,
                  0, 0, 3, 0, 0,
                  0, 2, 3, 0, 0,
                  0, 0, 0, 2, 4,
                  2, 0, 0, 2, 0,
                  ])),
              );
            },
            child: const ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Game 2'),
              subtitle: Text('5x5 puzzle id 2,000,000'),
            ),
          ),
        ],
      ),
    );
  }
}
