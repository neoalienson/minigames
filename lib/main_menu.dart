import 'package:flutter/material.dart';
import 'package:minigames/risk/risk.dart';
import 'ai_games/tictactoe.dart';
import 'ai_games/tictactoe3x4.dart';
import 'ai_games/shikaku_menu.dart';
import 'ai_games/hamster_race.dart';
import 'ai_games/whack_a_mole.dart';
import 'utils/authentication.dart';
import 'widgets/google_sign_in_button.dart';
import '../res/custom_colors.dart';

class MainMenuPage extends StatefulWidget {
  @override
  _MainMenuPageState createState() => _MainMenuPageState();
}

class MenuItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget Function(BuildContext) function;

  MenuItem(this.icon, this.title, this.subtitle, this.function);  
}

class _MainMenuPageState extends State<MainMenuPage> {
  Widget signinButton(BuildContext context) {
    return FutureBuilder(
      future: Authentication.initializeFirebase(context: context),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const Text('Error initializing Firebase');
        } else if (snapshot.connectionState == ConnectionState.done) {
          return GoogleSignInButton();
        }
        return CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(
            CustomColors.firebaseOrange,
          ),
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    var widgets = <Widget>[signinButton(context)];
    final menu = <MenuItem>[
        MenuItem(Icons.gamepad, 'Tic Tac Toe', 'A classic game of Xs and Os', 
          (context) => const TicTacToePage()),
        MenuItem(Icons.gamepad, 'Tic Tac Toe 3 players in 4 x 4', 'A modified game in 4 x 4 Grid for 3 players', 
          (context) => TicTacToe3x4Page()),
        MenuItem(Icons.gamepad, 'Shikaku', 'Shikaku',
          (context) => ShikakuGameMenu()),
        MenuItem(Icons.gamepad, 'Hamster Race', '',
          (context) => HamsterRaceScreen()),
        MenuItem(Icons.gamepad, 'Whack a Hamster', '',
          (context) => WhackAMoleGame()),
        MenuItem(Icons.map_rounded, 'Risk Dices', 'Throw dices and resolve',
          (context) => RiskDiceSelection()),
      ];

    for (var i in menu) {
      widgets.add(
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: i.function),
              );
            },
            child: ListTile(
              leading: Icon(i.icon),
              title: Text(i.title),
              subtitle: Text(i.subtitle),
            ),
          ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Game Menu'),
      ),
      body: ListView(
        children: widgets,
      ),
    );
  }
}