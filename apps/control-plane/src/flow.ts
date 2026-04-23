import type { EntryType } from "./types";

const FLOW_ID_PATTERN = /^flow_[a-z0-9]+_[a-z0-9]{6}$/;

export class FlowGuardError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FlowGuardError";
	}
}

const randomToken = (length = 8) => {
	const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

export const generateFlowId = (now = Date.now()) =>
	`flow_${now.toString(36)}_${randomToken(6)}`;

export const assertFlowId = (value: string) => {
	if (!FLOW_ID_PATTERN.test(value)) {
		throw new FlowGuardError(
			`Invalid flowId "${value}". Expected pattern: ${FLOW_ID_PATTERN.source}`,
		);
	}

	return value;
};

export interface FlowScaffold {
	flowId: string;
	newDraftId: () => string;
	newPreviewSessionId: () => string;
	newPreviewToken: () => string;
	newPublishEventId: () => string;
	assertSameFlow: (incomingFlowId: string | undefined, context: string) => void;
	assertEntryType: (
		incomingType: string | undefined,
		expected: EntryType,
	) => void;
}

export const createFlowScaffold = (incomingFlowId?: string): FlowScaffold => {
	const flowId = incomingFlowId
		? assertFlowId(incomingFlowId)
		: generateFlowId();
	const prefixedId = (prefix: string) =>
		`${prefix}_${flowId}_${randomToken(8)}`;

	return {
		flowId,
		newDraftId: () => prefixedId("draft"),
		newPreviewSessionId: () => prefixedId("preview"),
		newPreviewToken: () => prefixedId("previewtok"),
		newPublishEventId: () => prefixedId("pub"),
		assertSameFlow: (incoming, context) => {
			if (!incoming) {
				return;
			}

			const normalized = assertFlowId(incoming);
			if (normalized !== flowId) {
				throw new FlowGuardError(
					`Flow mismatch in ${context}: expected ${flowId}, received ${normalized}`,
				);
			}
		},
		assertEntryType: (incoming, expected) => {
			if (!incoming) {
				return;
			}

			if (incoming !== expected) {
				throw new FlowGuardError(
					`Entry type mismatch: expected ${expected}, received ${incoming}`,
				);
			}
		},
	};
};
