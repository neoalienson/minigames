// File generated by FlutterFire CLI.
// ignore_for_file: lines_longer_than_80_chars, avoid_classes_with_only_static_members
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for macos - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.windows:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for windows - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAhgnO2K8hO91TNa5EOU-hn1gati7u5-_E',
    appId: '1:1004132490441:web:7067a6d5ffa6ff2654c118',
    messagingSenderId: '1004132490441',
    projectId: 'minigames-e7278',
    authDomain: 'minigames-e7278.firebaseapp.com',
    storageBucket: 'minigames-e7278.appspot.com',
    measurementId: 'G-CKX6XPRL2X',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyD_rximi-q3PdnAQj4S_SB8-CecItjaAsM',
    appId: '1:1004132490441:android:96378d57a21e36c054c118',
    messagingSenderId: '1004132490441',
    projectId: 'minigames-e7278',
    storageBucket: 'minigames-e7278.appspot.com',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBDF8j-tUsVH8KcskRuc7YiW0foGwGX_3E',
    appId: '1:1004132490441:ios:40033d2a8c15664354c118',
    messagingSenderId: '1004132490441',
    projectId: 'minigames-e7278',
    storageBucket: 'minigames-e7278.appspot.com',
    iosClientId: '1004132490441-f9ksuj5eatj8sog9fspb66cti5o64a1m.apps.googleusercontent.com',
    iosBundleId: 'com.example.minigames',
  );
}