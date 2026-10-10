#!/bin/bash
# Execution wrapper for CodeVerse sandbox
# This script is called by the execution server with environment variables set

# Read configuration from environment
LANG=${EXEC_LANGUAGE}
TIMEOUT=${EXEC_TIMEOUT:-5000}
STDIN_FILE=${EXEC_STDIN_FILE:-/dev/null}
CODE_DIR=${EXEC_CODE_DIR:-/workspace}

cd "$CODE_DIR"

# Determine compile and run commands based on language
case "$LANG" in
    python)
        exec timeout --signal=KILL ${TIMEOUT}ms python3 main.py < "$STDIN_FILE"
        ;;
    javascript)
        exec timeout --signal=KILL ${TIMEOUT}ms node main.js < "$STDIN_FILE"
        ;;
    typescript)
        # Compile TS to JS first
        tsc main.ts --outDir /tmp --target ES2020 --module commonjs 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms node /tmp/main.js < "$STDIN_FILE"
        ;;
    c)
        gcc -o /tmp/program main.c -lm 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms /tmp/program < "$STDIN_FILE"
        ;;
    cpp)
        g++ -o /tmp/program main.cpp -std=c++17 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms /tmp/program < "$STDIN_FILE"
        ;;
    java)
        javac Main.java 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms java Main < "$STDIN_FILE"
        ;;
    go)
        go build -o /tmp/program main.go 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms /tmp/program < "$STDIN_FILE"
        ;;
    rust)
        rustc main.rs -o /tmp/program 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms /tmp/program < "$STDIN_FILE"
        ;;
    php)
        exec timeout --signal=KILL ${TIMEOUT}ms php main.php < "$STDIN_FILE"
        ;;
    csharp)
        dotnet build -o /tmp/cs-out 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms dotnet /tmp/cs-out/Program.dll < "$STDIN_FILE"
        ;;
    kotlin)
        kotlinc main.kt -include-runtime -d /tmp/program.jar 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms java -jar /tmp/program.jar < "$STDIN_FILE"
        ;;
    dart)
        dart compile exe main.dart -o /tmp/program 2>&1
        if [ $? -ne 0 ]; then
            exit 1
        fi
        exec timeout --signal=KILL ${TIMEOUT}ms /tmp/program < "$STDIN_FILE"
        ;;
    sql)
        # SQLite execution
        exec timeout --signal=KILL ${TIMEOUT}ms sqlite3 < "$STDIN_FILE" < main.sql
        ;;
    *)
        echo "Unsupported language: $LANG" >&2
        exit 1
        ;;
esac
