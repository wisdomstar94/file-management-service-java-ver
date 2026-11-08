package com.fms.entities;

/** 공개 링크가 기본으로 보여 줄 버전을 정하는 방식 */
public enum ShareLinkDefaultVersionMode {
    /** 자료의 기본 버전을 따른다. */
    FOLLOW_DOCUMENT,
    /** {@code fixedVersionId} 버전으로 고정한다. */
    FIXED
}
