import 'dart:math';

class RiskCombat {
  static RiskResolution resolve(List<int> _atts, List<int> _defs) {
    var resolution = RiskResolution();
    resolution.atts = List.filled(_atts.length, false);
    resolution.defs = List.filled(_defs.length, false);

    for (var i = 0, j = 0; i < _atts.length && j < _defs.length; i++) {
      if (_atts[i] <= _defs[j]) {
        resolution.atts[i] = true;
      } else {
        resolution.defs[j] = true;
      }
      j++;
    }

    return resolution;
  }
}

// result of combat resolution. true is killed.
class RiskResolution {
  List<bool> atts = [];
  List<bool> defs = [];
}

class RiskDices {
  List<int> atts = [];
  List<int> defs = [];

  final _rng = Random();

  RiskDices();

  // also sort results
  void roll(int att, int def) {
    atts.clear();
    defs.clear();

    for (var i = 0; i < att; i++) {
      atts.add(_rng.nextInt(6));
    }

    for (var i = 0; i < def; i++) {
      defs.add(_rng.nextInt(6));
    }

    // sort the results for displaying properly
    atts.sort();
    atts = atts.reversed.toList();
    defs.sort();
    defs = defs.reversed.toList();
  }
}