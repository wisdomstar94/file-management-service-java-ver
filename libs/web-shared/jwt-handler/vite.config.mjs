import { createLibViteConfig } from "../../../scripts/create-lib-vite-config.mjs";

export default createLibViteConfig({ external: [/^jose/] });
