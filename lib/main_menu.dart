import 'package:flutter/material.dart';
import 'tictactoe.dart';
import 'tictactoe3x4.dart';
import 'shikaku_menu.dart';
import 'hamster_race.dart';
import 'whack_a_mole.dart';
import 'utils/authentication.dart';
import 'widgets/google_sign_in_button.dart';
import '../res/custom_colors.dart';

class MainMenuPage extends StatefulWidget {
  @override
  _MainMenuPageState createState() => _MainMenuPageState();
}

class _MainMenuPageState extends State<MainMenuPage> {
  Widget signinButton(BuildContext context) {
    return FutureBuilder(
      future: Authentication.initializeFirebase(context: context),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return Text('Error initializing Firebase');
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
    return Scaffold(
      appBar: AppBar(
        title: Text('Game Menu'),
      ),
      body: ListView(
        children: [
          signinButton(context),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TicTacToePage()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Tic Tac Toe'),
              subtitle: Text('A classic game of Xs and Os'),
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => TicTacToe3x4Page()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Tic Tac Toe 3 players in 4 x 4'),
              subtitle: Text('A modified game in 4 x 4 Grid for 3 players'),
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => ShikakuGameMenu()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Shikaku'),
              subtitle: Text('Shikaku'),
            ),
          ),                  
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => HamsterRaceScreen()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('Hamster Race'),
              subtitle: Text(''),
            ),
          ),  
           GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => WhackAMoleGame()),
              );
            },
            child: ListTile(
              leading: Icon(Icons.gamepad),
              title: Text('whack a hamster'),
              subtitle: Text(''),
            ),
          ),  
        ],
      ),
    );
  }
}