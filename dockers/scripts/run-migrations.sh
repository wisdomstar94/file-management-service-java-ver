#!/bin/sh
# 컨테이너 기동 전에 Flyway 마이그레이션을 적용하고 기본 데이터(시드)를 넣는다. 둘 다 여러 번 실행해도 안전하다.
set -e
exec java -jar /app/database-manager.jar setup
