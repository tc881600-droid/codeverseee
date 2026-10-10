# 🎉 Unified Terminal - Simple & Intuitive!

## What Changed

**Before:** Separate tabs for Output and Input - confusing!
**Now:** One unified terminal - just like a real terminal!

## How It Works

### Single Terminal Interface

The output panel is now a **unified terminal** with:
- **Top section:** Shows program output (scrollable)
- **Bottom section:** Always-visible input area where you type stdin

No more switching between tabs! Just type your input at the bottom and click Run.

### Visual Layout

```
┌─────────────────────────────────────┐
│ Terminal                    ● success │  ← Header with status
├─────────────────────────────────────┤
│                                     │
│  Program output appears here...     │  ← Output (scrollable)
│  Enter number of students: 2        │
│  Enter details of student 1         │
│  Enter name: Alice                  │
│  Enter roll number: 101             │
│  Enter marks: 95                    │
│                                     │
│  --- Student Details ---            │
│  Name: Alice                        │
│  Roll No: 101                       │
│  Marks: 95                          │
│  Grade: A+                          │
│                                     │
│  ● exit 0 · 142ms · 2.1MB          │  ← Status line
├─────────────────────────────────────┤
│ ⌨ Input (stdin)              clear │  ← Always visible!
│ ┌─────────────────────────────────┐ │
│ │ 2                               │ │  ← Type input here
│ │ Alice                           │ │
│ │ 101                             │ │
│ │ 95                              │ │
│ └─────────────────────────────────┘ │
│ Press ⌘↵ to run                     │
└─────────────────────────────────────┘
```

## Usage Example

### Your C++ Student Program

```cpp
#include <iostream>
using namespace std;

class Student {
private:
    string name;
    int rollNo;
    float marks;

public:
    void input() {
        cout << "Enter name: ";
        cin >> name;
        cout << "Enter roll number: ";
        cin >> rollNo;
        cout << "Enter marks: ";
        cin >> marks;
    }

    void display() {
        cout << "\n--- Student Details ---\n";
        cout << "Name: " << name << endl;
        cout << "Roll No: " << rollNo << endl;
        cout << "Marks: " << marks << endl;

        if (marks >= 90) cout << "Grade: A+" << endl;
        else if (marks >= 80) cout << "Grade: A" << endl;
        else cout << "Grade: B" << endl;
    }
};

int main() {
    int n;
    cout << "Enter number of students: ";
    cin >> n;

    Student students[50];
    for (int i = 0; i < n; i++) {
        cout << "\nEnter details of student " << i + 1 << endl;
        students[i].input();
    }

    cout << "\n========== ALL STUDENTS ==========\n";
    for (int i = 0; i < n; i++) {
        students[i].display();
    }

    return 0;
}
```

### How to Run

1. **Type your input in the bottom section:**
   ```
   2
   Alice
   101
   95
   Bob
   102
   87
   ```

2. **Click "Run"** (or press ⌘↵)

3. **See the output above:**
   ```
   Enter number of students:
   Enter details of student 1
   Enter name: Enter roll number: Enter marks:
   Enter details of student 2
   Enter name: Enter roll number: Enter marks:

   ========== ALL STUDENTS ==========

   --- Student Details ---
   Name: Alice
   Roll No: 101
   Marks: 95
   Grade: A+

   --- Student Details ---
   Name: Bob
   Roll No: 102
   Marks: 87
   Grade: A
   ```

## Features

### ✅ Unified Interface
- No more tab switching
- Input always visible at bottom
- Output scrolls above
- Just like a real terminal

### ✅ Smart Input Area
- **Multi-line input** - Enter multiple values (one per line)
- **Line counter** - Shows how many lines of input
- **Clear button** - Quickly reset input
- **Auto-resize** - Grows as you type (up to 6 lines)

### ✅ Visual Feedback
- **Status indicator** - Shows running/success/error state
- **Execution time** - See how long your code took
- **Memory usage** - Monitor resource consumption
- **Exit code** - Know if program succeeded

### ✅ Keyboard Shortcuts
- **⌘↵ (Cmd+Enter)** - Run program
- **Tab** - Insert spaces in code editor
- **Enter** - Smart indent in code editor

## Input Format

### One Value Per Line
```
42
hello
3.14
```

### Multiple Values
```
2          ← number of students
Alice      ← student 1 name
101        ← student 1 roll
95         ← student 1 marks
Bob        ← student 2 name
102        ← student 2 roll
87         ← student 2 marks
```

### Empty Lines
```
first line

third line
```

## Reading Input in Different Languages

### Python
```python
name = input()
age = int(input())
print(f"{name} is {age} years old")
```

### C
```c
#include <stdio.h>
int main() {
    int x;
    scanf("%d", &x);
    printf("You entered: %d\n", x);
    return 0;
}
```

### C++
```cpp
#include <iostream>
using namespace std;
int main() {
    string name;
    cin >> name;
    cout << "Hello, " << name << "!" << endl;
    return 0;
}
```

### Java
```java
import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("Number: " + n);
    }
}
```

### JavaScript (Node.js)
```javascript
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    console.log(`You typed: ${line}`);
    rl.close();
});
```

## Tips

### For Interactive Programs
If your program asks for multiple inputs:
1. Type all inputs in the input area (one per line)
2. Click Run
3. Program reads them in order

### For Batch Processing
```
Input:
5
10
15
20
25

Program reads: 5 numbers, processes them
```

### Clear Input
- Click the **"clear"** button next to "Input (stdin)"
- Or manually delete the text

### Check Input Count
- Look at the line counter: "3 lines"
- Make sure you have enough input for your program

## Comparison: Before vs After

### Before (Confusing)
```
[Output] [Input] [Problems] [Info]
         ↑
    Had to click this tab
    to type input
```

### After (Simple!)
```
┌─────────────────────┐
│ Terminal            │  ← One unified view
├─────────────────────┤
│ Output here...      │
│                     │
├─────────────────────┤
│ Input (stdin)       │  ← Always visible!
│ [type here]         │
└─────────────────────┘
```

## Troubleshooting

### "Program seems stuck"
- **Cause:** Program is waiting for input
- **Solution:** Make sure you typed all needed input in the input area

### "Not enough input"
- **Cause:** Program needs more input than you provided
- **Solution:** Check line counter, add more lines

### "Input not being read"
- **Cause:** Wrong input format
- **Solution:** One value per line, check your code's input reading logic

### "Output not showing"
- **Cause:** Program crashed or has no output
- **Solution:** Check for errors in the output area

## Summary

✅ **Unified terminal** - No more tabs!
✅ **Input always visible** - Type right there
✅ **Simple workflow** - Type input → Run → See output
✅ **Works for all languages** - Python, C++, Java, etc.
✅ **Just like real terminal** - Intuitive and familiar

Now you can run your C++ student program (or any program) by simply typing input at the bottom and clicking Run. No more confusing tabs! 🚀
