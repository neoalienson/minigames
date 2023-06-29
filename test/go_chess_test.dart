import 'package:flutter_test/flutter_test.dart';
import 'package:minigames/ai_games/go_chess_game.dart';

void main() {
  group('shouldRemovePiece', () {
    test('returns false for an empty space', () {
      final board = [
        [ChessPiece.empty, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.empty],
      ];

      expect(shouldRemovePiece(0, 0, board), isFalse);
    });

    test('returns false for a piece with liberties', () {
      final board = [
        [ChessPiece.whiteStone, ChessPiece.empty, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.blackStone, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.empty, ChessPiece.empty],
      ];

      expect(shouldRemovePiece(0, 0, board), isFalse);
    });

    test('returns true for a piece with no liberties', () {
      final board = [
        [ChessPiece.whiteStone, ChessPiece.empty, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.blackStone, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.empty, ChessPiece.whiteStone],
      ];

      expect(shouldRemovePiece(1, 1, board), isTrue);
    });

    test('returns false for a group with liberties', () {
      final board = [
        [ChessPiece.empty, ChessPiece.empty, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.whiteStone, ChessPiece.blackStone],
        [ChessPiece.empty, ChessPiece.blackStone, ChessPiece.whiteStone],
      ];

      expect(shouldRemovePiece(1, 1, board), isFalse);
      expect(shouldRemovePiece(1, 2, board), isFalse);
      expect(shouldRemovePiece(2, 1, board), isFalse);
      expect(shouldRemovePiece(2, 2, board), isFalse);
    });

    test('returns true for a group with no liberties', () {
      final board = [
        [ChessPiece.empty, ChessPiece.empty, ChessPiece.empty],
        [ChessPiece.empty, ChessPiece.whiteStone, ChessPiece.whiteStone],
        [ChessPiece.empty, ChessPiece.whiteStone, ChessPiece.blackStone],
      ];

      expect(shouldRemovePiece(1, 1, board), isTrue);
      expect(shouldRemovePiece(1, 2, board), isTrue);
      expect(shouldRemovePiece(2, 1, board), isTrue);
      expect(shouldRemovePiece(2, 2, board), isFalse);
    });
  });
}