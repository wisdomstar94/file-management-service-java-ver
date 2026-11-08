#!/bin/sh
# 격리된 도커 환경을 띄워 e2e 를 실행하고, 끝나면 환경을 지운다.
#   sh scripts/run-e2e.sh servers   # servers 의 jest e2e
#   sh scripts/run-e2e.sh webs      # webs 의 playwright e2e
#   sh scripts/run-e2e.sh           # 둘 다
set -u
COMPOSE="docker compose --env-file $(dirname "$0")/../.env.e2e -f $(dirname "$0")/../dockers/compose.e2e.yml"
TARGETS="${1:-all}"

$COMPOSE --profile runner build
$COMPOSE up -d --wait api admin-web user-web || { $COMPOSE logs; $COMPOSE down -v; exit 1; }

STATUS=0
if [ "$TARGETS" = "all" ] || [ "$TARGETS" = "servers" ]; then
  $COMPOSE run --rm e2e-servers || STATUS=1
fi
if [ "$TARGETS" = "all" ] || [ "$TARGETS" = "webs" ]; then
  $COMPOSE run --rm e2e-webs || STATUS=1
fi

$COMPOSE down -v
exit $STATUS
