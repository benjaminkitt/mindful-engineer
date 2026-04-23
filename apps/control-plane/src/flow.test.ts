import { strict as assert } from "node:assert";
import test from "node:test";

import { assertFlowId, createFlowScaffold, FlowGuardError } from "./flow";

test("createFlowScaffold reuses provided flow id and enforces match", () => {
	const scaffold = createFlowScaffold("flow_abc123_1a2b3c");
	assert.equal(scaffold.flowId, "flow_abc123_1a2b3c");
	assert.doesNotThrow(() =>
		scaffold.assertSameFlow("flow_abc123_1a2b3c", "test"),
	);
	assert.throws(
		() => scaffold.assertSameFlow("flow_wrong_1a2b3c", "test"),
		FlowGuardError,
	);
});

test("assertFlowId rejects malformed flow ids", () => {
	assert.throws(() => assertFlowId("invalid"), FlowGuardError);
	assert.equal(assertFlowId("flow_kz9f_123abc"), "flow_kz9f_123abc");
});
