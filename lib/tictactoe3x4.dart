
import 'package:flutter/material.dart';

class TicTacToeScreen extends StatefulWidget {
  @override
  _TicTacToeScreenState createState() => _TicTacToeScreenState();
}

class _TicTacToeScreenState extends State<TicTacToeScreen> {
  int _currentPlayer = 1;
  List<List<int>> _board = List.generate(4, (_) => List.generate(4, (_) => 0));

  void _onTileTap(int row, int col) {
    if (_board[row][col] == 0) {
      setState(() {
        _board[row][col] = _currentPlayer;
        _currentPlayer = (_currentPlayer % 3) + 1;
      });
    }
  }

  void _resetGame() {
    setState(() {
      _board = List.generate(4, (_) => List.generate(4, (_) => 0));
      _currentPlayer = 1;
    });
  }

  Widget _buildTile(int row, int col) {
    Color backgroundColor = Colors.white;
    Color textColor = Colors.black;
    String text = '';

    switch (_board[row][col]) {
      case 1:
        backgroundColor = Colors.red;
        textColor = Colors.white;
        text = 'X';
        break;
      case 2:
        backgroundColor = Colors.green;
        textColor = Colors.white;
        text = 'O';
        break;
      case 3:
        backgroundColor = Colors.blue;
        textColor = Colors.white;
        text = 'T';
        break;
    }

    return GestureDetector(
      onTap: () => _onTileTap(row, col),
      child: Container(
        margin: EdgeInsets.all(4),
        height: 80,
        width: 80,
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            text,
            style: TextStyle(color: textColor, fontSize: 48),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> rows = [];

    for (int row = 0; row < 4; row++) {
      List<Widget> tiles = [];

      for (int col = 0; col < 4; col++) {
        tiles.add(_buildTile(row, col));
      }

      rows.add(Row(children: tiles));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Tic Tac Toe: 3 Players'),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.all(16),
            child: Text(
              'Player $_currentPlayer\'s turn',
              style: TextStyle(fontSize: 24),
            ),
          ),
          Column(children: rows),
          TextButton(
            onPressed: _resetGame,
            child: Text('Reset Game'),
          ),
        ],
      ),
    );
  }
}