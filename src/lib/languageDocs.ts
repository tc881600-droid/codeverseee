/**
 * Complete Documentation Content for All Languages
 * Full course material in document format
 */

export interface DocSection {
  title: string;
  content: string;
  code?: string;
  codeLang?: string;
}

export interface DocChapter {
  id: string;
  title: string;
  sections: DocSection[];
}

export interface LanguageDoc {
  language: string;
  title: string;
  description: string;
  chapters: DocChapter[];
}

export const LANGUAGE_DOCS: Record<string, LanguageDoc> = {
  python: {
    language: "python",
    title: "Python Complete Course",
    description: "Master Python from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to Python",
        sections: [
          {
            title: "1.1 What is Python?",
            content: "Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, Python has become one of the most popular programming languages in the world.\n\nPython is used in:\n• Web Development (Django, Flask)\n• Data Science & Machine Learning (Pandas, NumPy, TensorFlow)\n• Automation & Scripting\n• Scientific Computing\n• Artificial Intelligence\n• Desktop Applications",
          },
          {
            title: "1.2 Why Learn Python?",
            content: "• Easy to learn and read - Python's syntax is clean and intuitive\n• Versatile - Used in web, data science, AI, automation, and more\n• Huge community - Millions of developers and extensive documentation\n• Rich ecosystem - Thousands of libraries and frameworks\n• High demand - One of the most sought-after skills in tech industry\n• Cross-platform - Works on Windows, Mac, and Linux",
          },
          {
            title: "1.3 Setting Up Python",
            content: "To start programming in Python, you need to:\n\n1. Download Python from python.org\n2. Install Python on your system\n3. Verify installation: Open terminal/command prompt and type 'python --version'\n4. Choose an IDE (VS Code, PyCharm, or use online editors)\n5. Start coding!",
            code: "# Your first Python program\nprint(\"Hello, World!\")\nprint(\"Welcome to Python!\")\n\n# Variables\nname = \"CodeVerse\"\nage = 2024\nprint(f\"Learning Python with {name} in {age}\")",
            codeLang: "python",
          },
        ],
      },
      {
        id: "ch2",
        title: "Chapter 2: Variables and Data Types",
        sections: [
          {
            title: "2.1 Variables in Python",
            content: "Variables are containers for storing data values. In Python, you don't need to declare variable types - Python figures it out automatically (dynamic typing).\n\nRules for variable names:\n• Must start with a letter or underscore\n• Can contain letters, numbers, and underscores\n• Case-sensitive (age, Age, and AGE are different)\n• Cannot use Python keywords (if, for, class, etc.)",
            code: "# Variable assignment\nname = \"Alice\"      # String\nage = 25            # Integer\nheight = 5.6        # Float\nis_student = True   # Boolean\n\n# Multiple assignment\nx, y, z = 1, 2, 3\n\n# Print variables\nprint(f\"Name: {name}\")\nprint(f\"Age: {age}\")\nprint(f\"Height: {height}\")\nprint(f\"Student: {is_student}\")",
            codeLang: "python",
          },
          {
            title: "2.2 Data Types",
            content: "Python has several built-in data types:\n\n1. Numeric Types:\n   • int - Integer values (whole numbers)\n   • float - Floating point numbers (decimals)\n   • complex - Complex numbers\n\n2. String Type:\n   • str - Text data (sequences of characters)\n\n3. Boolean Type:\n   • bool - True or False values\n\n4. Sequence Types:\n   • list - Ordered, mutable collection\n   • tuple - Ordered, immutable collection\n   • range - Sequence of numbers\n\n5. Mapping Type:\n   • dict - Key-value pairs (dictionary)\n\n6. Set Types:\n   • set - Unordered collection of unique items\n   • frozenset - Immutable set",
            code: "# Numeric types\ninteger_num = 42\nfloat_num = 3.14159\ncomplex_num = 2 + 3j\n\n# String\nmessage = \"Hello, Python!\"\nmultiline = \"\"\"This is\na multiline\nstring\"\"\"\n\n# Boolean\nis_true = True\nis_false = False\n\n# List (mutable)\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfruits.append(\"date\")\n\n# Tuple (immutable)\ncoordinates = (10, 20, 30)\n\n# Dictionary\nperson = {\n    \"name\": \"Alice\",\n    \"age\": 25,\n    \"city\": \"New York\"\n}\n\n# Set\nunique_numbers = {1, 2, 3, 3, 4}  # {1, 2, 3, 4}\n\n# Check types\nprint(type(integer_num))  # <class 'int'>\nprint(type(fruits))       # <class 'list'>",
            codeLang: "python",
          },
          {
            title: "2.3 Type Conversion",
            content: "You can convert between different data types using type conversion functions:\n\n• int() - Convert to integer\n• float() - Convert to float\n• str() - Convert to string\n• bool() - Convert to boolean\n• list() - Convert to list\n• tuple() - Convert to tuple\n• set() - Convert to set",
            code: "# Type conversion examples\nnum_str = \"42\"\nnum_int = int(num_str)      # String to int\nnum_float = float(num_str)  # String to float\nback_str = str(num_int)     # Int to string\n\nprint(f\"String: {num_str}, type: {type(num_str)}\")\nprint(f\"Int: {num_int}, type: {type(num_int)}\")\nprint(f\"Float: {num_float}, type: {type(num_float)}\")\n\n# Boolean conversion\nprint(bool(0))        # False\nprint(bool(1))        # True\nprint(bool(\"\"))       # False\nprint(bool(\"Hello\"))  # True\nprint(bool([]))       # False\nprint(bool([1, 2]))   # True",
            codeLang: "python",
          },
        ],
      },
      {
        id: "ch3",
        title: "Chapter 3: Operators and Expressions",
        sections: [
          {
            title: "3.1 Arithmetic Operators",
            content: "Arithmetic operators are used to perform mathematical operations:\n\n• + Addition\n• - Subtraction\n• * Multiplication\n• / Division (returns float)\n• // Floor division (returns integer)\n• % Modulus (remainder)\n• ** Exponentiation (power)",
            code: "a = 15\nb = 4\n\nprint(f\"a + b = {a + b}\")    # 19\nprint(f\"a - b = {a - b}\")    # 11\nprint(f\"a * b = {a * b}\")    # 60\nprint(f\"a / b = {a / b}\")    # 3.75\nprint(f\"a // b = {a // b}\")  # 3\nprint(f\"a % b = {a % b}\")    # 3\nprint(f\"a ** b = {a ** b}\")  # 50625",
            codeLang: "python",
          },
          {
            title: "3.2 Comparison Operators",
            content: "Comparison operators compare two values and return True or False:\n\n• == Equal to\n• != Not equal to\n• > Greater than\n• < Less than\n• >= Greater than or equal to\n• <= Less than or equal to",
            code: "x = 10\ny = 20\n\nprint(f\"x == y: {x == y}\")  # False\nprint(f\"x != y: {x != y}\")  # True\nprint(f\"x > y: {x > y}\")    # False\nprint(f\"x < y: {x < y}\")    # True\nprint(f\"x >= 10: {x >= 10}\") # True\nprint(f\"y <= 20: {y <= 20}\") # True",
            codeLang: "python",
          },
          {
            title: "3.3 Logical Operators",
            content: "Logical operators are used to combine conditional statements:\n\n• and - Returns True if both statements are true\n• or - Returns True if at least one statement is true\n• not - Reverses the result, returns False if the result is true",
            code: "age = 25\nhas_license = True\nis_sober = True\n\n# AND operator\nprint(age >= 18 and has_license)  # True\n\n# OR operator\nprint(age < 18 or has_license)    # True\n\n# NOT operator\nprint(not has_license)            # False\n\n# Complex condition\ncan_drive = age >= 18 and has_license and is_sober\nprint(f\"Can drive: {can_drive}\")  # True",
            codeLang: "python",
          },
        ],
      },
      {
        id: "ch4",
        title: "Chapter 4: Control Flow",
        sections: [
          {
            title: "4.1 Conditional Statements (if-elif-else)",
            content: "Conditional statements allow you to execute code based on conditions:\n\n• if - Executes code if condition is True\n• elif - Executes if previous conditions were False and this is True\n• else - Executes if all previous conditions were False",
            code: "age = 20\n\n# Simple if\nif age >= 18:\n    print(\"You are an adult\")\n\n# if-else\nif age >= 18:\n    print(\"You can vote\")\nelse:\n    print(\"You cannot vote yet\")\n\n# if-elif-else\nscore = 85\n\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelif score >= 70:\n    grade = \"C\"\nelif score >= 60:\n    grade = \"D\"\nelse:\n    grade = \"F\"\n\nprint(f\"Score: {score}, Grade: {grade}\")  # Grade: B",
            codeLang: "python",
          },
          {
            title: "4.2 Loops - for Loop",
            content: "The for loop is used to iterate over a sequence (list, tuple, string, range, etc.):\n\nSyntax: for variable in sequence:\n            # code block",
            code: "# Iterating over a list\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfor fruit in fruits:\n    print(fruit)\n\n# Using range()\nfor i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\n# Range with start, stop, step\nfor i in range(2, 10, 2):\n    print(i)  # 2, 4, 6, 8\n\n# Iterating over string\nfor char in \"Python\":\n    print(char)\n\n# Nested loops\nfor i in range(3):\n    for j in range(2):\n        print(f\"i={i}, j={j}\")",
            codeLang: "python",
          },
          {
            title: "4.3 Loops - while Loop",
            content: "The while loop executes code as long as a condition is True:\n\nSyntax: while condition:\n            # code block\n\nImportant: Make sure the condition eventually becomes False, or you'll create an infinite loop!",
            code: "# Basic while loop\ncount = 0\nwhile count < 5:\n    print(f\"Count: {count}\")\n    count += 1\n\n# While with break\nnum = 0\nwhile True:\n    if num == 5:\n        break\n    print(num)\n    num += 1\n\n# While with continue\ni = 0\nwhile i < 10:\n    i += 1\n    if i % 2 == 0:\n        continue  # Skip even numbers\n    print(i)  # Prints: 1, 3, 5, 7, 9",
            codeLang: "python",
          },
        ],
      },
      {
        id: "ch5",
        title: "Chapter 5: Functions",
        sections: [
          {
            title: "5.1 Defining Functions",
            content: "Functions are reusable blocks of code that perform specific tasks:\n\nSyntax: def function_name(parameters):\n            # code block\n            return value\n\nBenefits of functions:\n• Code reusability\n• Better organization\n• Easier debugging\n• Modularity",
            code: "# Simple function\ndef greet():\n    print(\"Hello, World!\")\n\ngreet()  # Call the function\n\n# Function with parameters\ndef greet_person(name):\n    print(f\"Hello, {name}!\")\n\ngreet_person(\"Alice\")\ngreet_person(\"Bob\")\n\n# Function with return value\ndef add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(f\"5 + 3 = {result}\")\n\n# Function with default parameter\ndef power(base, exponent=2):\n    return base ** exponent\n\nprint(power(3))      # 9 (3^2)\nprint(power(3, 3))   # 27 (3^3)",
            codeLang: "python",
          },
          {
            title: "5.2 Advanced Function Features",
            content: "Python functions have many advanced features:\n\n• Multiple return values\n• *args (variable positional arguments)\n• **kwargs (variable keyword arguments)\n• Lambda functions (anonymous functions)\n• Docstrings (documentation)\n• Type hints",
            code: "# Multiple return values\ndef get_min_max(numbers):\n    return min(numbers), max(numbers)\n\nminimum, maximum = get_min_max([3, 1, 4, 1, 5, 9])\nprint(f\"Min: {minimum}, Max: {maximum}\")\n\n# *args - variable number of arguments\ndef sum_all(*args):\n    return sum(args)\n\nprint(sum_all(1, 2, 3))       # 6\nprint(sum_all(1, 2, 3, 4, 5)) # 15\n\n# **kwargs - variable keyword arguments\ndef print_info(**kwargs):\n    for key, value in kwargs.items():\n        print(f\"{key}: {value}\")\n\nprint_info(name=\"Alice\", age=25, city=\"NYC\")\n\n# Lambda function\nsquare = lambda x: x ** 2\nprint(square(5))  # 25\n\n# Function with docstring\ndef calculate_area(radius):\n    \"\"\"Calculate the area of a circle.\n    \n    Args:\n        radius: The radius of the circle\n    \n    Returns:\n        The area of the circle\n    \"\"\"\n    import math\n    return math.pi * radius ** 2\n\nprint(calculate_area(5))",
            codeLang: "python",
          },
        ],
      },
    ],
  },

  javascript: {
    language: "javascript",
    title: "JavaScript Complete Course",
    description: "Master JavaScript from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to JavaScript",
        sections: [
          {
            title: "1.1 What is JavaScript?",
            content: "JavaScript is a high-level, interpreted programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications.\n\nJavaScript is used for:\n• Frontend Web Development (React, Vue, Angular)\n• Backend Development (Node.js)\n• Mobile Apps (React Native)\n• Desktop Apps (Electron)\n• Game Development\n• Serverless Functions",
          },
          {
            title: "1.2 Why Learn JavaScript?",
            content: "• Runs everywhere - browsers, servers, mobile, desktop\n• Essential for web development - every website uses it\n• Huge ecosystem - npm has over 1 million packages\n• High demand - most in-demand programming language\n• Versatile - frontend, backend, mobile, desktop\n• Active community - extensive resources and support",
          },
          {
            title: "1.3 Your First JavaScript",
            content: "JavaScript can be added to HTML in three ways:\n1. Inline - using onclick and other event attributes\n2. Internal - using <script> tag in HTML\n3. External - linking to a separate .js file\n\nLet's start with the basics:",
            code: "// Your first JavaScript program\nconsole.log(\"Hello, World!\");\nconsole.log(\"Welcome to JavaScript!\");\n\n// Variables\nlet name = \"CodeVerse\";\nconst year = 2024;\nvar oldWay = \"avoid using var\"; // Old way, avoid\n\nconsole.log(`Learning ${name} in ${year}`);\n\n// Alert and Prompt (browser only)\n// alert(\"Hello!\");\n// let userInput = prompt(\"Enter your name:\");",
            codeLang: "javascript",
          },
        ],
      },
      {
        id: "ch2",
        title: "Chapter 2: Variables and Data Types",
        sections: [
          {
            title: "2.1 Variable Declaration",
            content: "JavaScript has three ways to declare variables:\n\n• let - Block-scoped, can be reassigned\n• const - Block-scoped, cannot be reassigned (constant)\n• var - Function-scoped, old way (avoid in modern code)\n\nBest practices:\n• Use const by default\n• Use let when you need to reassign\n• Avoid var in modern JavaScript",
            code: "// const - cannot be reassigned\nconst PI = 3.14159;\nconst name = \"Alice\";\n// PI = 3.14; // Error!\n\n// let - can be reassigned\nlet age = 25;\nage = 26; // OK\n\n// var - old way (avoid)\nvar oldVariable = \"don't use this\";\n\n// Block scope\nif (true) {\n  let blockScoped = \"I'm block scoped\";\n  const alsoBlockScoped = \"Me too\";\n  var functionScoped = \"I'm function scoped\";\n}\n// console.log(blockScoped); // Error!\n// console.log(functionScoped); // Works!",
            codeLang: "javascript",
          },
          {
            title: "2.2 Data Types",
            content: "JavaScript has 7 primitive data types and 1 complex type:\n\nPrimitive Types:\n1. string - Text data\n2. number - Integer and floating-point\n3. boolean - true or false\n4. undefined - Variable declared but not assigned\n5. null - Intentional absence of value\n6. symbol - Unique identifier (ES6)\n7. bigint - Large integers (ES2020)\n\nComplex Type:\n8. object - Collections of key-value pairs\n   • Arrays are special objects\n   • Functions are special objects",
            code: "// String\nlet message = \"Hello, JavaScript!\";\nlet template = `Name: ${message}`; // Template literal\n\n// Number\nlet integer = 42;\nlet float = 3.14159;\nlet negative = -10;\n\n// Boolean\nlet isTrue = true;\nlet isFalse = false;\n\n// Undefined\nlet notAssigned;\nconsole.log(notAssigned); // undefined\n\n// Null\nlet empty = null;\n\n// Symbol\nlet sym = Symbol(\"description\");\n\n// BigInt\nlet bigNumber = 9007199254740991n;\n\n// Object\nlet person = {\n  name: \"Alice\",\n  age: 25,\n  city: \"New York\"\n};\n\n// Array (special object)\nlet fruits = [\"apple\", \"banana\", \"cherry\"];\n\n// Check types\nconsole.log(typeof message);    // \"string\"\nconsole.log(typeof integer);    // \"number\"\nconsole.log(typeof isTrue);     // \"boolean\"\nconsole.log(typeof notAssigned); // \"undefined\"\nconsole.log(typeof empty);      // \"object\" (quirk!)\nconsole.log(typeof person);     // \"object\"\nconsole.log(Array.isArray(fruits)); // true",
            codeLang: "javascript",
          },
        ],
      },
    ],
  },

  // HTML Documentation
  html: {
    language: "html",
    title: "HTML Complete Course",
    description: "Master HTML from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to HTML",
        sections: [
          {
            title: "1.1 What is HTML?",
            content: "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page using markup.\n\nHTML elements are the building blocks of HTML pages. HTML elements are represented by tags, which label pieces of content such as 'heading', 'paragraph', 'table', and so on.\n\nKey points:\n• HTML is NOT a programming language - it's a markup language\n• HTML tells the browser how to display content\n• HTML elements are represented by tags\n• Tags label pieces of content",
          },
          {
            title: "1.2 HTML Document Structure",
            content: "Every HTML document follows a basic structure:\n\n<!DOCTYPE html> - Declares the document type and HTML version\n<html> - The root element of an HTML page\n<head> - Contains meta information about the document\n<title> - Specifies a title for the document\n<body> - Contains the visible page content",
            code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>My First Web Page</title>\n</head>\n<body>\n    <h1>Welcome to HTML!</h1>\n    <p>This is my first web page.</p>\n</body>\n</html>",
            codeLang: "html",
          },
        ],
      },
      {
        id: "ch2",
        title: "Chapter 2: HTML Elements and Tags",
        sections: [
          {
            title: "2.1 Headings",
            content: "HTML headings are defined with the <h1> to <h6> tags.\n\n<h1> defines the most important heading\n<h6> defines the least important heading\n\nUse headings to show the structure of your content. Search engines use headings to index the structure of your pages.",
            code: "<h1>Heading 1 - Most Important</h1>\n<h2>Heading 2</h2>\n<h3>Heading 3</h3>\n<h4>Heading 4</h4>\n<h5>Heading 5</h5>\n<h6>Heading 6 - Least Important</h6>",
            codeLang: "html",
          },
          {
            title: "2.2 Paragraphs and Text",
            content: "Paragraphs are defined with the <p> tag.\n\nOther text formatting tags:\n• <strong> or <b> - Bold text\n• <em> or <i> - Italic text\n• <mark> - Highlighted text\n• <small> - Smaller text\n• <del> - Deleted text\n• <ins> - Inserted text\n• <sub> - Subscript text\n• <sup> - Superscript text",
            code: "<p>This is a paragraph.</p>\n<p>This is <strong>bold</strong> text.</p>\n<p>This is <em>italic</em> text.</p>\n<p>This is <mark>highlighted</mark> text.</p>\n<p>H<sub>2</sub>O is water.</p>\n<p>E = mc<sup>2</sup></p>",
            codeLang: "html",
          },
        ],
      },
    ],
  },

  // CSS Documentation
  css: {
    language: "css",
    title: "CSS Complete Course",
    description: "Master CSS from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to CSS",
        sections: [
          {
            title: "1.1 What is CSS?",
            content: "CSS (Cascading Style Sheets) is used to style and layout web pages. It controls how HTML elements are displayed on screen.\n\nCSS is used for:\n• Styling - colors, fonts, spacing\n• Layout - positioning, flexbox, grid\n• Animations - transitions, transforms\n• Responsive design - media queries\n\nCSS saves a lot of work. It can control the layout of multiple web pages all at once.",
          },
          {
            title: "1.2 CSS Syntax",
            content: "A CSS rule consists of a selector and a declaration block.\n\nSelector - Points to the HTML element you want to style\nDeclaration block - Contains one or more declarations separated by semicolons\n\nEach declaration includes a CSS property name and a value, separated by a colon.",
            code: "/* CSS Syntax */\nselector {\n    property: value;\n    property: value;\n}\n\n/* Example */\nh1 {\n    color: blue;\n    font-size: 24px;\n    text-align: center;\n}\n\np {\n    color: red;\n    line-height: 1.5;\n}",
            codeLang: "css",
          },
        ],
      },
      {
        id: "ch2",
        title: "Chapter 2: CSS Selectors",
        sections: [
          {
            title: "2.1 Basic Selectors",
            content: "CSS selectors are used to select the HTML elements you want to style.\n\nTypes of selectors:\n• Element selector - Selects by tag name (p, h1, div)\n• Class selector - Selects by class attribute (.classname)\n• ID selector - Selects by id attribute (#idname)\n• Universal selector - Selects all elements (*)\n• Grouping selector - Selects multiple elements (h1, h2, p)",
            code: "/* Element selector */\np {\n    color: blue;\n}\n\n/* Class selector */\n.highlight {\n    background-color: yellow;\n}\n\n/* ID selector */\n#header {\n    font-size: 24px;\n}\n\n/* Universal selector */\n* {\n    margin: 0;\n    padding: 0;\n}\n\n/* Grouping selector */\nh1, h2, p {\n    font-family: Arial;\n}",
            codeLang: "css",
          },
        ],
      },
    ],
  },

  // C Documentation
  c: {
    language: "c",
    title: "C Programming Complete Course",
    description: "Master C programming from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to C",
        sections: [
          {
            title: "1.1 What is C?",
            content: "C is a general-purpose, procedural programming language developed by Dennis Ritchie at Bell Labs in 1972. It's one of the most widely used programming languages and has influenced many modern languages.\n\nC is used for:\n• Operating Systems (Unix, Linux, Windows)\n• System Programming\n• Embedded Systems\n• Game Development\n• Database Systems\n• Compilers and Interpreters",
          },
          {
            title: "1.2 Your First C Program",
            content: "Let's write a simple C program to understand the basic structure:\n\n#include <stdio.h> - Preprocessor directive to include standard input/output library\nint main() - Main function where program execution begins\nprintf() - Function to print output\nreturn 0 - Exit status",
            code: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    printf(\"Welcome to C Programming!\\n\");\n    \n    // Variables\n    int age = 25;\n    float height = 5.9;\n    char grade = 'A';\n    \n    printf(\"Age: %d\\n\", age);\n    printf(\"Height: %.1f\\n\", height);\n    printf(\"Grade: %c\\n\", grade);\n    \n    return 0;\n}",
            codeLang: "c",
          },
        ],
      },
    ],
  },

  // C++ Documentation
  cpp: {
    language: "cpp",
    title: "C++ Complete Course",
    description: "Master C++ from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to C++",
        sections: [
          {
            title: "1.1 What is C++?",
            content: "C++ is a general-purpose programming language created by Bjarne Stroustrup in 1979 as an extension of the C language. It supports object-oriented, procedural, and generic programming.\n\nC++ is used for:\n• Game Development\n• System Software\n• Application Software\n• Embedded Systems\n• High-Performance Applications\n• Database Systems",
          },
          {
            title: "1.2 Your First C++ Program",
            content: "C++ uses cout for output and cin for input. The iostream library must be included.\n\nKey differences from C:\n• cout instead of printf\n• cin instead of scanf\n• Classes and objects\n• References and pointers\n• Templates and generics",
            code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    cout << \"Welcome to C++ Programming!\" << endl;\n    \n    // Variables\n    int age = 25;\n    double height = 5.9;\n    char grade = 'A';\n    string name = \"Alice\";\n    \n    cout << \"Name: \" << name << endl;\n    cout << \"Age: \" << age << endl;\n    cout << \"Height: \" << height << endl;\n    cout << \"Grade: \" << grade << endl;\n    \n    return 0;\n}",
            codeLang: "cpp",
          },
        ],
      },
    ],
  },

  // Java Documentation
  java: {
    language: "java",
    title: "Java Complete Course",
    description: "Master Java from basics to advanced concepts",
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1: Introduction to Java",
        sections: [
          {
            title: "1.1 What is Java?",
            content: "Java is a high-level, class-based, object-oriented programming language developed by Sun Microsystems (now Oracle) in 1995.\n\nJava's key features:\n• Platform Independent (Write Once, Run Anywhere)\n• Object-Oriented\n• Robust and Secure\n• Multithreaded\n• High Performance\n• Distributed\n\nJava is used for:\n• Enterprise Applications\n• Android Apps\n• Web Applications\n• Big Data Technologies\n• Scientific Computing",
          },
          {
            title: "1.2 Your First Java Program",
            content: "Java programs must be written inside a class. The main method is the entry point of the program.\n\nKey points:\n• Class name must match filename\n• main method signature is fixed\n• System.out.println() for output\n• Java is case-sensitive",
            code: "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n        System.out.println(\"Welcome to Java Programming!\");\n        \n        // Variables\n        int age = 25;\n        double height = 5.9;\n        char grade = 'A';\n        String name = \"Alice\";\n        boolean isStudent = true;\n        \n        System.out.println(\"Name: \" + name);\n        System.out.println(\"Age: \" + age);\n        System.out.println(\"Height: \" + height);\n        System.out.println(\"Grade: \" + grade);\n        System.out.println(\"Student: \" + isStudent);\n    }\n}",
            codeLang: "java",
          },
        ],
      },
    ],
  },
};

export const ALL_LANGUAGE_DOCS = LANGUAGE_DOCS;
