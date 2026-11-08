package com.fms.api.commons;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/** 원본 {@code Date#toISOString()} 과 같은 형식(UTC, 밀리초 3자리 고정)으로 시각을 내보낸다. */
public final class IsoTimes {
    private static final DateTimeFormatter FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneOffset.UTC);

    private IsoTimes() {}

    public static String format(Instant instant) {
        return instant == null ? null : FORMAT.format(instant.truncatedTo(ChronoUnit.MILLIS));
    }

    public static String now() {
        return format(Instant.now());
    }
}
