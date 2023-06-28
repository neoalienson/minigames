import 'package:flutter_test/flutter_test.dart';
import 'package:minigames/dice_roller.dart';

void main() {
  test('isDouble returns true for double roll', () {
    var page = DiceRollerState();
    expect(page.isDouble([1, 1, 2]), isTrue);
    expect(page.isDouble([3, 4, 4]), isTrue);
    expect(page.isDouble([6, 2, 6]), isTrue);
  });

  test('isDouble returns false for non-double roll', () {
    var page = DiceRollerState();    
    expect(page.isDouble([1, 2, 3]), isFalse);
    expect(page.isDouble([4, 5, 6]), isFalse);
  });

  test('isTriple returns true for triple roll', () {
    var page = DiceRollerState();    
    expect(page.isTriple([1, 1, 1]), isTrue);
    expect(page.isTriple([4, 4, 4]), isTrue);
    expect(page.isTriple([6, 6, 6]), isTrue);
  });

  test('isTriple returns false for non-triple roll', () {
    var page = DiceRollerState();    
    expect(page.isTriple([1, 2, 3]), isFalse);
    expect(page.isTriple([4, 5, 6]), isFalse);
    expect(page.isTriple([1, 1, 2]), isFalse);
  });

  test('getMatchingNumber returns matching number for double roll', () {
    var page = DiceRollerState();    
    expect(page.getMostRepeated([1, 1, 2]), equals(1));
    expect(page.getMostRepeated([3, 4, 4]), equals(4));
    expect(page.getMostRepeated([6, 2, 6]), equals(6));
    expect(page.getMostRepeated([1, 1, 1]), equals(1));  
    expect(page.getMostRepeated([3, 3, 3]), equals(3));  
    expect(page.getMostRepeated([6, 6, 6]), equals(6));    
  });

  test('getMatchingNumber throws error for non-double roll', () {
    var page = DiceRollerState();    
    expect(() => page.getMostRepeated([1, 2, 3]), throwsStateError);
    expect(() => page.getMostRepeated([4, 5, 6]), throwsStateError);
  });
}