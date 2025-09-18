import 'package:flutter/material.dart';

class ScrumSizingPage extends StatefulWidget {
  const ScrumSizingPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _ScrumSizingPageState createState() => _ScrumSizingPageState();
}

class _ScrumSizingPageState extends State<ScrumSizingPage> {
  int _selectedSize = 0;
  final _sizes = [1, 2, 3, 5, 8, 13, 21];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scrum Sizing'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Select a size:',
              style: TextStyle(fontSize: 24.0),
            ),
            const SizedBox(height: 20.0),
            Wrap(
              spacing: 10.0,
              children: _sizes
                  .map((size) => ChoiceChip(
                        label: Text(size.toString()),
                        selected: _selectedSize == size,
                        onSelected: (isSelected) {
                          setState(() {
                            _selectedSize = isSelected ? size : 0;
                          });
                        },
                      ))
                  .toList(),
            ),
            const SizedBox(height: 20.0),
            ElevatedButton(
              onPressed: _selectedSize == 0
                  ? null
                  : () {
                      // Handle selected size
                    },
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }
}