import 'package:flutter/material.dart';

class ScrumTShirtSizingPage extends StatefulWidget {
  const ScrumTShirtSizingPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _ScrumTShirtSizingPageState createState() => _ScrumTShirtSizingPageState();
}

class _ScrumTShirtSizingPageState extends State<ScrumTShirtSizingPage> {
  String _selectedSize = '';
  final _sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scrum T-Shirt Sizing'),
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
                        label: Text(size),
                        selected: _selectedSize == size,
                        onSelected: (isSelected) {
                          setState(() {
                            _selectedSize = isSelected ? size : '';
                          });
                        },
                      ))
                  .toList(),
            ),
            const SizedBox(height: 20.0),
            ElevatedButton(
              onPressed: _selectedSize.isEmpty
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