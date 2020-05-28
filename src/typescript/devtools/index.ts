export interface DebugFlags {
    addboi?: boolean;
}

export const DEBUG_FLAGS: DebugFlags = {

}


declare global {
    var DEBUG_FLAGS: DebugFlags
}

globalThis.DEBUG_FLAGS = DEBUG_FLAGS;
