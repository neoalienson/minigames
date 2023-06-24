
import 'package:flutter/material.dart';

class TicTacToe3x4Page extends StatefulWidget {
  @override
  TicTacToe3x4PageState createState() => TicTacToe3x4PageState();
}

class TicTacToe3x4PageState extends State<TicTacToe3x4Page> {
  int _currentPlayer = 1;
  List<List<int>> _board = List.generate(4, (_) => List.generate(4, (_) => 0));

  void _onTileTap(int row, int col) {
    if (_board[row][col] == 0) {
      setState(() {
        _board[row][col] = _currentPlayer;

        int result = checkForWinnerOrDraw(_board);
        if (result != 0) {
          String message;
          if (result == 4) {
            message = 'Draw!';
          } else {
            message = 'Player $result wins!';
          }

          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('Game Over'),
                content: Text(message),
                actions: [
                  TextButton(
                    onPressed: _resetGame,
                    child: const Text('Play Again'),
                  ),
                ],
              );
            },
          );
        } else {
          _currentPlayer = (_currentPlayer % 3) + 1;
        }
      });
    }
  }

  int checkForWinnerOrDraw(List<List<int>> board) {
    // Check rows
    for (int row = 0; row < 4; row++) {
      for (int col = 0; col < 2; col++) {
        if (board[row][col] != 0 &&
            board[row][col] == board[row][col + 1] &&
            board[row][col + 1] == board[row][col + 2]) {
          return board[row][col];
        }
      }
    }

    // Check columns
    for (int col = 0; col < 4; col++) {
      for (int row = 0; row < 2; row++) {
        if (board[row][col] != 0 &&
            board[row][col] == board[row + 1][col] &&
            board[row + 1][col] == board[row + 2][col]) {
          return board[row][col];
        }
      }
    }

    // Check diagonals
    if (board[0][0] != 0 &&
        board[0][0] == board[1][1] &&
        board[1][1] == board[2][2]) {
      return board[0][0];
    }

    if (board[0][3] != 0 &&
        board[0][3] == board[1][2] &&
        board[1][2] == board[2][1]) {
      return board[0][3];
    }

    // Check for draw
    bool hasEmptyTile = false;
    for (int row = 0; row < 4; row++) {
      for (int col = 0; col < 4; col++) {
        if (board[row][col] == 0) {
          hasEmptyTile = true;
          break;
        }
      }
      if (hasEmptyTile) {
        break;
      }
    }
    if (!hasEmptyTile) {
      return 4;
    }

    return 0;
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
        margin: const EdgeInsets.all(4),
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
        title: const Text('Tic Tac Toe: 3 Players'),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: Text(
              'Player $_currentPlayer\'s turn',
              style: const TextStyle(fontSize: 24),
            ),
          ),
          Column(children: rows),
          TextButton(
            onPressed: _resetGame,
            child: const Text('Reset Game'),
          ),
        ],
      ),
    );
  }
}