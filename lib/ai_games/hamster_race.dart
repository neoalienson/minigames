import 'package:flutter/material.dart';

class HamsterRaceScreen extends StatefulWidget {
  const HamsterRaceScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _HamsterRaceScreenState createState() => _HamsterRaceScreenState();
}

class _HamsterRaceScreenState extends State<HamsterRaceScreen> {
  List<double> _playerPositions = List.filled(7, 0.0);
  bool _gameOver = false;

  void _movePlayer(int playerIndex) {
    setState(() {
      _playerPositions[playerIndex] += 10;
      if (_playerPositions[playerIndex] >= 300) {
        _gameOver = true;
      }
    });
  }

  void _resetGame() {
    setState(() {
      _playerPositions = List.filled(7, 0.0);
      _gameOver = false;
    });
  }

  Widget _buildPlayerButtons() {
    return Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          for (var i = 0; i < 7; i++)
            SizedBox(
              width: 60,
              child: ElevatedButton(
                onPressed: !_gameOver ? () => _movePlayer(i) : null,
                child: Text('Hamster ${i + 1}'),
              ),
            ),
        ],
      );    
  }

  List<Widget> _buildPlayerImages() {
    var a = <Widget>[];
      for (var i = 0; i < 7; i++) {
        a.add(Positioned(
                    left: _playerPositions[i],
                    top: i * 70.0,
                    child: SizedBox(
                      width: 50,
                      height: 50,
                      child: Image.asset('images/hamster${i + 1}.png'),
                    ),
                  )
        );
      }
    return a;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hamster Race'),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('images/track.png'),
            repeat: ImageRepeat.repeat,
          ),
        ),
        child: Column(
        children: [
          Expanded(
            child: Stack(
              children: _buildPlayerImages(),
            ),
          ),
          if (_gameOver)
            Text('Hamster ${_playerPositions.indexOf(_playerPositions.reduce((a, b) => a > b ? a : b)) + 1} wins!'),
          GestureDetector(
            onTap: !_gameOver ? () => _movePlayer(0) : null,
            child: Container(
              height: 50.0,
              color: Colors.transparent,
            ),
          ),
          _buildPlayerButtons(),
        ],
      ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _resetGame,
        child: const Icon(Icons.refresh),
      ),
    );
  }
}