import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:minigames/risk/risk_combat.dart';

void main() {
  test('Check combat resolution 1 vs 1', () {
    var result = RiskCombat.resolve([1], [1]);
    assert(listEquals(result.atts, [ true ]));
    assert(listEquals(result.defs, [ false ]));
  });

  test('Check combat resolution 3 vs 1', () {
    var result = RiskCombat.resolve([6, 1, 1], [3]);
    assert(listEquals(result.atts, [ false, false, false ]));
    assert(listEquals(result.defs, [ true ]));
  });

  test('Check combat resolution 3 vs 2', () {
    var result = RiskCombat.resolve([6, 2, 1], [3, 2]);
    assert(listEquals(result.atts, [ false, true, false ]));
    assert(listEquals(result.defs, [ true, false ]));
  });

  test('Check combat resolution 2 vs 2', () {
    var result = RiskCombat.resolve([3, 3], [4, 3]);
    assert(listEquals(result.atts, [ true, true ]));
    assert(listEquals(result.defs, [ false, false ]));
  });
  test('Check combat resolution 1 vs 2', () {
    var result = RiskCombat.resolve([6], [5, 4]);
    assert(listEquals(result.atts, [ false ]));
    assert(listEquals(result.defs, [ true, false ]));
  });
}