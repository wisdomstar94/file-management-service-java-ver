let sequence = 0;

/** 편집 화면 블록 · 행의 React key */
export const createKey = () => `block-${++sequence}`;
