export const VIDEO_CALL_EVENTS = {
    INVITE: "call:invite",
    ACCEPT: "call:accept",
    REJECT: "call:reject",
    CANCEL: "call:cancel",
    END: "call:end",
    OFFER: "call:offer",
    ANSWER: "call:answer",
    ICE_CANDIDATE: "call:ice-candidate",
    BUSY: "call:busy",
    TIMEOUT: "call:timeout",
    ERROR: "call:error",
} as const;

export type VideoCallEventName = (typeof VIDEO_CALL_EVENTS)[keyof typeof VIDEO_CALL_EVENTS];

export const VIDEO_CALL_TIMEOUT_MS = 30_000;

export const VIDEO_CALL_TYPE = "video" as const;
export type VideoCallType = typeof VIDEO_CALL_TYPE;

export const VIDEO_CALL_STATES = {
    IDLE: "idle",
    OUTGOING: "outgoing",
    INCOMING: "incoming",
    RINGING: "ringing",
    CONNECTING: "connecting",
    ACTIVE: "active",
    ENDED: "ended",
    REJECTED: "rejected",
    MISSED: "missed",
    FAILED: "failed",
    CANCELLED: "cancelled",
} as const;

export type VideoCallState = (typeof VIDEO_CALL_STATES)[keyof typeof VIDEO_CALL_STATES];

export type VideoCallPayloadBase = {
    callId: string;
    fromUserId: string;
    toUserId: string;
    timestamp: number;
};

export type CallInvitePayload = VideoCallPayloadBase & {
    callType: VideoCallType;
    conversationId?: string;
};

export type CallAcceptPayload = VideoCallPayloadBase;

export type CallRejectPayload = VideoCallPayloadBase & {
    reason?: string;
};

export type CallCancelPayload = VideoCallPayloadBase;

export type CallEndPayload = VideoCallPayloadBase & {
    reason?: string;
};

export type CallBusyPayload = VideoCallPayloadBase;

export type CallTimeoutPayload = VideoCallPayloadBase;

export type CallErrorPayload = VideoCallPayloadBase & {
    error: string;
};

type SdpType = "offer" | "answer";

export type SessionDescriptionPayload = VideoCallPayloadBase & {
    sdp: {
        type: SdpType;
        sdp: string;
    };
};

export type IceCandidatePayload = VideoCallPayloadBase & {
    candidate: {
        candidate: string;
        sdpMid: string | null;
        sdpMLineIndex: number | null;
        usernameFragment?: string | null;
    };
};

const stateTransitions: Readonly<Record<VideoCallState, readonly VideoCallState[]>> = {
    idle: ["outgoing", "incoming"],
    outgoing: ["ringing", "cancelled", "failed"],
    incoming: ["ringing", "rejected", "missed"],
    ringing: ["connecting", "cancelled", "rejected", "missed", "failed", "ended"],
    connecting: ["active", "failed", "ended"],
    active: ["ended", "failed"],
    ended: [],
    rejected: [],
    missed: [],
    failed: [],
    cancelled: [],
};

const terminalStates: ReadonlySet<VideoCallState> = new Set([
    "ended",
    "rejected",
    "missed",
    "failed",
    "cancelled",
]);

export const canTransitionCallState = (from: VideoCallState, to: VideoCallState): boolean => {
    return stateTransitions[from].includes(to);
};

export const isTerminalCallState = (state: VideoCallState): boolean => {
    return terminalStates.has(state);
};
