import 'package:flutter_test/flutter_test.dart';
import 'package:minigames/ai_games/shikaku.dart';

void main() {
  group('isValidSelection', () {
    late ShikakuGameState state;

    setUp(() {
      state = ShikakuGameState([
        1, 0, 0, 
        0, 2, 0, 
        0, 0, 3]);
    });

    test('valid selection returns true', () {
      // Test a valid selection of the number 1, although a game should not have 1
      expect(state.isValidSelection(0, 0, 0, 0), isTrue); 

      // Test a valid selection of the number 2
      expect(state.isValidSelection(1, 1, 1, 2), isTrue); // select the second row, columns 2 and 3
      expect(state.isValidSelection(1, 1, 2, 1), isTrue); 
      expect(state.isValidSelection(0, 1, 1, 1), isTrue); 
      expect(state.isValidSelection(1, 0, 1, 1), isTrue); 

      // Test a valid selection of the number 3
      expect(state.isValidSelection(2, 0, 2, 2), isTrue); 
    });

    test('invalid selection returns false', () {
      expect(state.isValidSelection(2, 1, 2, 2), isFalse); // select the third row, columns 2 and 3

      // Test an invalid selection where more than one positive integer is selected
      expect(state.isValidSelection(0, 0, 1, 1), isFalse); // select the first two rows and columns

      expect(state.isValidSelection(0, 1, 2, 2), isFalse);
    });
  });
}