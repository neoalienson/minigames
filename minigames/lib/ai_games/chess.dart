import 'package:flutter/material.dart';

class ChessBoardPage extends StatefulWidget {
  const ChessBoardPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _ChessBoardPageState createState() => _ChessBoardPageState();
}

class _ChessBoardPageState extends State<ChessBoardPage> {
  // Define the starting position of the chess pieces
  final _chessBoard = [
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ];

  // Define the selected position on the chess board
  int _selectedRow = -1;
  int _selectedCol = -1;

  // Define the current player
  String _currentPlayer = 'White';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chess Board'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Current player: $_currentPlayer',
              style: const TextStyle(fontSize: 24.0),
            ),
            const SizedBox(height: 20.0),
            Container(
              decoration: BoxDecoration(
                color: Colors.grey[400],
                border: Border.all(color: Colors.black, width: 2.0),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (int row = 0; row < _chessBoard.length; row++)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        for (int col = 0; col < _chessBoard[row].length; col++)
                          GestureDetector(
                            onTap: () => _selectPosition(row, col),
                            child: Container(
                              width: 40.0,
                              height: 40.0,
                              color: _getColor(row, col),
                              child: _getChessPiece(row, col),
                            ),
                          ),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Get the color of a position on the chess board
  Color _getColor(int row, int col) {
    if ((row + col) % 2 == 0) {
      return Colors.white;
    } else {
      return Colors.black;
    }
  }

  // Get the chess piece for a position on the chess board
  Widget _getChessPiece(int row, int col) {
    String piece = _chessBoard[row][col];
    if (piece.isNotEmpty) {
      return Text(
        piece,
        style: TextStyle(fontSize: 32.0),
      );
    } else {
      return Text(
        " ",
        style: TextStyle(fontSize: 32.0),
      );
    }
  }

  // Select a position on the chess board
  void _selectPosition(int row, int col) {
    setState(() {
      if (_selectedRow == -1 && _selectedCol == -1) {
        // If no position is currently selected, select the current position
        String piece = _chessBoard[row][col];
        if (piece.isNotEmpty) {
          _selectedRow = row;
          _selectedCol = col;
        }
      } else {
        // If a position is currently selected, move the piece to the new position
        String piece = _chessBoard[_selectedRow][_selectedCol];
        _chessBoard[_selectedRow][_selectedCol] = '';
        _chessBoard[row][col] = piece;
        _selectedRow = -1;
        _selectedCol = -1;
        _currentPlayer = _currentPlayer == 'White' ? 'Black' : 'White';
      }
    });
  }
}