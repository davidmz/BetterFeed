import fixer from "./fix-names";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    if (!settings.flag("fix-names")) {
        fixer(node, settings);
    }
};
