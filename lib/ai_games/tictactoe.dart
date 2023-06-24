import 'package:flutter/material.dart';

class TicTacToePage extends StatefulWidget {
  const TicTacToePage({Key? key}) : super(key: key);

  @override
  TicTacToePageState createState() => TicTacToePageState();
}

class TicTacToePageState extends State<TicTacToePage> {
  List<List<String>> grid = List.generate(3, (_) => List.filled(3, ''));

  String currentPlayer = 'X';
  bool gameOver = false;
  String winner = '';

  void _playMove(int row, int col) {
    if (grid[row][col] != '' || gameOver) {
      return;
    }

    setState(() {
      grid[row][col] = currentPlayer;

      if (checkForWinner(row, col)) {
        gameOver = true;
        winner = currentPlayer;
        return;
      }

      if (checkForDraw()) {
        gameOver = true;
        return;
      }

      currentPlayer = currentPlayer == 'X' ? 'O' : 'X';
    });
  }

  bool checkForWinner(int row, int col) {
    // Check row
    if (grid[row].every((value) => value == currentPlayer)) {
      return true;
    }

    // Check column
    if (grid.every((row) => row[col] == currentPlayer)) {
      return true;
    }

    // Check diagonal
    var i = 0;
    if (row == col && grid.every((row) => row[i++] == currentPlayer)) {
      return true;
    }

    // Check anti-diagonal
    i = 2;
    if (row + col == 2 && grid.every((row) => row[i--] == currentPlayer)) {
      return true;
    }

    return false;
  }

  bool checkForDraw() {
    for (var row in grid) {
      for (var cell in row) {
        if (cell == '') {
          return false;
        }
      }
    }

    return true;
  }

  void _restartGame() {
    setState(() {
      grid = List.generate(3, (_) => List.filled(3, ''));
      currentPlayer = 'X';
      gameOver = false;
      winner = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tic Tac Toe'),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          for (var i = 0; i < grid.length; i++)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var j = 0; j < grid[i].length; j++)
                  GestureDetector(
                    onTap: () => _playMove(i, j),
                    child: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        border: Border.all(),
                      ),
                      child: Center(
                        child: Text(
                          grid[i][j],
                          style: TextStyle(fontSize: 32),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          if (gameOver)
            Text(
              winner != '' ? '$winner wins!' : 'Draw!',
              style: TextStyle(fontSize: 24),
            ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _restartGame,
        child: Icon(Icons.refresh),
      ),
    );
  }
}