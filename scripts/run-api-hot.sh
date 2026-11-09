#!/bin/sh
# servers/api 를 핫리로드로 띄운다. (yarn java:api:local + yarn java:api:watch 를 한 터미널에서)
#   FMS_ENV_FILE=.env.local sh scripts/run-api-hot.sh
# 저장하면 watch 가 다시 컴파일하고, devtools 가 api 를 자동 재시작한다. Ctrl+C 로 둘 다 끝난다.
set -u
cd "$(dirname "$0")/.." || exit 1

# 먼저 한 번 컴파일해 두 Gradle 실행이 같은 파일을 동시에 컴파일하지 않게 한다. 컴파일 에러면 여기서 멈춘다.
./gradlew -q :servers:api:classes || exit 1

# -q 라 컴파일 에러만 출력한다.
./gradlew -q -t :servers:api:classes &
WATCH_PID=$!
# sh 의 백그라운드 작업은 Ctrl+C(SIGINT)를 받지 않으므로 직접 끝낸다.
trap 'kill "$WATCH_PID" 2>/dev/null' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

./gradlew :servers:api:bootRun -PfmsDevtools
