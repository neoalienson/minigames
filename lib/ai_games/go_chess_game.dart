import 'dart:math';

enum ChessPiece {
  blackStone,
  whiteStone,
  empty,
}

bool shouldRemovePiece(int x, int y, List<List<ChessPiece>> board) {
  final piece = board[x][y];

  if (piece == ChessPiece.empty) {
    return false; // empty spaces should not be removed
  }

  final visited = List.generate(board.length, (_) => List.filled(board[0].length, false));

  final liberties = _getLiberties(x, y, piece, board, visited);

  if (liberties.isNotEmpty) {
    return false; // pieces with liberties should not be removed
  }

  final group = _getGroup(x, y, piece, board, visited);

  return group.every((p) => _getLiberties(p.x, p.y, piece, board, visited).isEmpty);
}

List<Point<int>> _getLiberties(int x, int y, ChessPiece piece, List<List<ChessPiece>> board, List<List<bool>> visited) {
  visited[x][y] = true;

  final liberties = <Point<int>>[];

  for (final delta in [Point(-1, 0), Point(1, 0), Point(0, -1), Point(0, 1)]) {
    final nx = x + delta.x;
    final ny = y + delta.y;

    if (nx < 0 || nx >= board.length || ny < 0 || ny >= board[0].length) {
      continue;
    }

    if (visited[nx][ny]) {
      continue;
    }

    final neighbor = board[nx][ny];

    if (neighbor == ChessPiece.empty) {
      liberties.add(Point(nx, ny));
    } else if (neighbor == piece) {
      liberties.addAll(_getLiberties(nx, ny, piece, board, visited));
    }
  }

  return liberties;
}

List<Point<int>> _getGroup(int x, int y, ChessPiece piece, List<List<ChessPiece>> board, List<List<bool>> visited) {
  visited[x][y] = true;

  final group = [Point(x, y)];

  for (final delta in [Point(-1, 0), Point(1, 0), Point(0, -1), Point(0, 1)]) {
    final nx = x + delta.x;
    final ny = y + delta.y;

    if (nx < 0 || nx >= board.length || ny < 0 || ny >= board[0].length) {
      continue;
    }

    if (visited[nx][ny]) {
      continue;
    }

    final neighbor = board[nx][ny];

    if (neighbor == piece) {
      group.addAll(_getGroup(nx, ny, piece, board, visited));
    }
  }

  return group;
}