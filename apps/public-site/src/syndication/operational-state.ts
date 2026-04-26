import {
	type ReviewedSyndicationFlowId,
	SYNDICATION_PLATFORMS,
	type SyndicationEntryState,
	type SyndicationPlatform,
	type SyndicationStatus,
} from "./workflow";

export interface SyndicationOperationalRow {
	entry_key: string;
	platform: SyndicationPlatform;
	status: SyndicationStatus;
	prepared_text: string | null;
	approved_text: string | null;
	result_url: string | null;
	error_message: string | null;
	approved_at: string | null;
	queued_at: string | null;
	posted_at: string | null;
	updated_at: string;
	last_flow_id: ReviewedSyndicationFlowId;
}

export interface SyndicationOperationalSnapshot {
	entries: SyndicationEntryState[];
	rows: SyndicationOperationalRow[];
	generatedAt: string;
}

const cloneState = (state: SyndicationEntryState): SyndicationEntryState => ({
	...state,
	canonical: { ...state.canonical },
	variants: Object.fromEntries(
		SYNDICATION_PLATFORMS.map((platform) => [
			platform,
			{ ...state.variants[platform] },
		]),
	) as SyndicationEntryState["variants"],
});

export class InMemorySyndicationOperationalStore {
	private readonly states = new Map<string, SyndicationEntryState>();

	upsert(state: SyndicationEntryState) {
		this.states.set(state.entryKey, cloneState(state));
	}

	get(entryKey: string) {
		const state = this.states.get(entryKey);
		return state ? cloneState(state) : undefined;
	}

	list() {
		return Array.from(this.states.values()).map((state) => cloneState(state));
	}

	toRows(): SyndicationOperationalRow[] {
		const rows: SyndicationOperationalRow[] = [];

		for (const state of this.states.values()) {
			for (const platform of SYNDICATION_PLATFORMS) {
				const variant = state.variants[platform];
				rows.push({
					entry_key: state.entryKey,
					platform,
					status: variant.status,
					prepared_text: variant.preparedText ?? null,
					approved_text: variant.approvedText ?? null,
					result_url: variant.resultUrl ?? null,
					error_message: variant.errorMessage ?? null,
					approved_at: variant.approvedAt ?? null,
					queued_at: variant.queuedAt ?? null,
					posted_at: variant.postedAt ?? null,
					updated_at: state.updatedAt,
					last_flow_id: variant.lastFlowId,
				});
			}
		}

		return rows;
	}
}

export const createOperationalSnapshot = (
	store: InMemorySyndicationOperationalStore,
): SyndicationOperationalSnapshot => ({
	entries: store.list(),
	rows: store.toRows(),
	generatedAt: new Date().toISOString(),
});
