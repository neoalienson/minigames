import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

class TetrisGame extends StatefulWidget {
  @override
  _TetrisGameState createState() => _TetrisGameState();
}

class _TetrisGameState extends State<TetrisGame>
    with SingleTickerProviderStateMixin {
  static const int width = 10;
  static const int height = 20;
  static const double blockSize = 30.0;
  static const double borderSize = 1.0;
  static const Color borderColor = Colors.black;

  List<List<Color>> board = [];
  List<Offset> currentBlock = [];
  List<Offset> nextBlock = [];
  List<List<Offset>> blocks = [
    [
      const Offset(0, 0),
      const Offset(1, 0),
      const Offset(2, 0),
      const Offset(3, 0),
    ], // I block
    [
      const Offset(0, 0),
      const Offset(1, 0),
      const Offset(2, 0),
      const Offset(1, 1),
    ],
    [
      const Offset(0, 0),
      const Offset(1, 0),
      const Offset(1, 1),
      const Offset(2, 1),
    ],
    [
      const Offset(0, 1),
      const Offset(1, 1),
      const Offset(1, 0),
      const Offset(2, 0),
    ],
    [
      const Offset(0, 0),
      const Offset(0, 1),
      const Offset(1, 1),
      const Offset(1, 0),
    ], // O block
    [
      const Offset(0, 0),
      const Offset(1, 0),
      const Offset(2, 0),
      const Offset(2, 1),
    ],
    [
      const Offset(0, 1),
      const Offset(1, 1),
      const Offset(2, 1),
      const Offset(2, 0),
    ],
  ];
  List<Color> blockColors = [
    Colors.red,
    Colors.yellow,
    Colors.green,
    Colors.blueAccent,
    Colors.orange,
    Colors.pinkAccent,
    Colors.purpleAccent,
  ];
  late int currentBlockType;
  int score = 0;
  bool gameOver = false;
  late AnimationController controller;
  Duration duration = const Duration(milliseconds: 500);
  Timer? timer;

  @override
  void initState() {
    super.initState();
    resetGame();
    timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!gameOver) {
        moveBlock(const Offset(0, 1));
      }
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tetris'),
      ),
      body: Column(
        children: [
          Expanded(
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: width,
              ),
              itemBuilder: (BuildContext context, int index) {
                int x = index % width;
                int y = index ~/ width;
                Color color = board[y][x];
                if (currentBlock.any((block) => block.dx.toInt() == x && block.dy.toInt() == y)) {
                  color = blockColors[currentBlockType];
                }
                return Container(
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: Colors.grey,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      getBlockEmoji(color),
                      style: const TextStyle(fontSize: 32),
                    ),
                  ),
                );
              },
              itemCount: width * height,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Text('Score: $score'),
              ElevatedButton(
                onPressed: resetGame,
                child: const Text('Restart'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String getBlockEmoji(Color color) {
    return "A";
    if (color == Colors.yellow) {
      return '🟡';
    } else if (color == Colors.cyan) {
      return '🔵';
    } else if (color == Colors.orange) {
      return '🟠';
    } else if (color == Colors.blue) {
      return '🔷';
    } else if (color == Colors.green) {
      return '🟢';
    } else if (color == Colors.red) {
      return '🔴';
    } else if (color == Colors.purple) {
      return '🟣';
    } else {
      return '⬜';
    }
  }

  void moveBlock(Offset offset) {
    setState(() {
      currentBlock = currentBlock.map((block) => block + offset).toList();
    });
    if (currentBlock.any((block) => block.dy >= height)) {
      lockBlock();
      return;
    }
    if (currentBlock.any(
        (block) => board[block.dy.toInt()][block.dx.toInt()] != Colors.white)) {
      lockBlock();
      return;
    }
  }

  void rotateBlock() {
    List<Offset> rotatedBlock = currentBlock.map((block) {
      double x = block.dx - currentBlock[1].dx;
      double y = block.dy - currentBlock[1].dy;
      return Offset(currentBlock[1].dx - y, currentBlock[1].dy + x);
    }).toList();
    if (rotatedBlock.any((block) =>
        block.dx < 0 ||
        block.dx >= width ||
        block.dy >= height ||
        board[block.dy.toInt()][block.dx.toInt()] != Colors.white)) {
      return;
    }
    setState(() {
      currentBlock = rotatedBlock;
    });
  }

  void lockBlock() {
    setState(() {
      currentBlock.forEach((block) {
        board[block.dy.toInt()][block.dx.toInt()] =
            blockColors[currentBlockType];
      });
      newBlock();
    });
    checkRows();
  }

  void newBlock() {
    var nextBlockType = Random().nextInt(blocks.length);
    currentBlockType = nextBlockType ?? Random().nextInt(blocks.length);
    currentBlock = blocks[currentBlockType]
        .map((block) => block + Offset(width / 2 - 2, 0))
        .toList();
    nextBlock =
        blocks[nextBlockType].map((block) => block + Offset(1, 1)).toList();
    if (currentBlock.any(
        (block) => board[block.dy.toInt()][block.dx.toInt()] != Colors.white)) {
      setState(() {
        gameOver = true;
      });
      return;
    }
  }

  void checkRows() {
    int rowsCleared = 0;
    for (int i = height - 1; i >= 0; i--) {
      if (board[i].every((color) => color != Colors.white)) {
        board.removeAt(i);
        board.insert(0, List.filled(width, Colors.white));
        rowsCleared++;
        i++;
      }
    }
    if (rowsCleared > 0) {
      setState(() {
        score += rowsCleared * 100;
      });
    }
  }

  void resetGame() {
    setState(() {
      board = [];
      for (int i = 0; i < height; i++) {
        board.add(List.filled(width, Colors.white));
      }
      currentBlock = [];
      nextBlock = [];
      score = 0;
      gameOver = false;
      newBlock();
    });
    timer?.cancel();
    timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!gameOver) {
        moveBlock(const Offset(0, 1));
      }
    });
  }
}
