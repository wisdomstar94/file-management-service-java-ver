package com.fms.api.commons;

/** 검증 실패 항목. {@code path} 는 {@code ruleTree.children.0.cidrs} 처럼 점으로 잇는다. */
public record ValidationIssue(String path, String message) {}
