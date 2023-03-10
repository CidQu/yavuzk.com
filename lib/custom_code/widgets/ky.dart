// Automatic FlutterFlow imports
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:animated_text_kit/animated_text_kit.dart';

class Ky extends StatefulWidget {
  const Ky({
    Key? key,
    this.width,
    this.height,
  }) : super(key: key);

  final double? width;
  final double? height;

  @override
  _KyState createState() => _KyState();
}

class _KyState extends State<Ky> {
  @override
  Widget build(BuildContext context) {
    return AnimatedTextKit(
      animatedTexts: [
        RotateAnimatedText('Flutter',
            textStyle: const TextStyle(
              fontSize: 25.0,
              fontFamily: 'Outfit',
              color: Colors.white,
            ),
            textAlign: TextAlign.start),
        RotateAnimatedText('Reverse Engineering',
            textStyle: const TextStyle(
              fontSize: 25.0,
              fontFamily: 'Outfit',
              color: Colors.white,
            ),
            textAlign: TextAlign.start),
        RotateAnimatedText('Çevirmen',
            textStyle: const TextStyle(
              fontSize: 25.0,
              fontFamily: 'Outfit',
              color: Colors.white,
            ),
            textAlign: TextAlign.start),
      ],
    );
  }
}
