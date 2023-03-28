import "package:flutter_test/flutter_test.dart";
import "package:minigames/tictactoe3x4.dart";

void main() {
  test('Empty board should return 0', () {
    List<List<int>> board = List.generate(4, (_) => List.generate(4, (_) => 0));
    expect(TicTacToe3x4PageState().checkForWinnerOrDraw(board), 0);
  });

  test('Full board with no winner should return 4', () {
    List<List<int>> board = [
      [1, 2, 1, 2],
      [2, 1, 2, 1],
      [1, 2, 1, 2],
      [2, 1, 2, 0],
    ];
    expect(TicTacToe3x4PageState().checkForWinnerOrDraw(board), 4);
  });

  test('Horizontal win should return player number', () {
    List<List<int>> board = [
      [1, 1, 1, 0],
      [2, 2, 0, 0],
      [3, 3, 3, 0],
      [0, 0, 0, 0],
    ];
    expect(TicTacToe3x4PageState().checkForWinnerOrDraw(board), 1);
  });

  test('Vertical win should return player number', () {
    List<List<int>> board = [
      [1, 2, 3, 0],
      [1, 2, 0, 0],
      [1, 2, 3, 0],
      [0, 0, 0, 0],
    ];
    expect(TicTacToe3x4PageState().checkForWinnerOrDraw(board), 2);
  });

  test('Diagonal win should return player number', () {
    List<List<int>> board = [
      [1, 2, 3, 0],
      [2, 1, 0, 0],
      [3, 2, 1, 0],
      [0, 0, 0, 0],
    ];
    expect(TicTacToe3x4PageState().checkForWinnerOrDraw(board), 1);
  });
}