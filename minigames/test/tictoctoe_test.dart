import "package:flutter_test/flutter_test.dart";
import "package:minigames/ai_games/tictactoe.dart";

void main() {
    test('_checkForWinner returns true when diagonal cells are filled with the same player', () {
        final grid = [
            ['X', 'O', ''],
            ['O', 'X', 'X'],
            ['', '', 'X'],
        ];

        final ttt = TicTacToePageState();

        ttt.grid = grid;
        ttt.currentPlayer = 'X';

        final isWinner = ttt.checkForWinner(2, 2);

        expect(isWinner, isTrue);
    });

    test('_checkForWinner returns true when anti-diagonal cells are filled with the same player', () {
        final grid = [
            ['O', 'X', 'X'],
            ['O', 'X', 'O'],
            ['X', '', ''],
        ];

        final ttt = TicTacToePageState();

        ttt.grid = grid;
        ttt.currentPlayer = 'X';

        final isWinner = ttt.checkForWinner(0, 2);

        expect(isWinner, isTrue);
    });
}