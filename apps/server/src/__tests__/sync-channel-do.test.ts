import { env } from "cloudflare:test";
import type {
	InvalidateMessage,
	PresenceMessage,
	ServerMessage,
} from "@better-auth-cloudflare-starter/sync";
import { describe, expect, it } from "vitest";

const COALESCE_WAIT_MS = 150;

interface TestSocket {
	ws: WebSocket;
	messages: ServerMessage[];
	closes: { code: number; reason: string }[];
}

async function connect(
	channel: string,
	userId: string,
	expiresAt?: number,
): Promise<TestSocket> {
	const stub = env.SYNC_CHANNEL.getByName(channel);
	const headers = new Headers({
		Upgrade: "websocket",
		"x-sync-user-id": userId,
		"x-sync-channel": channel,
	});
	if (expiresAt) {
		headers.set("x-sync-expires-at", String(expiresAt));
	}
	const response = await stub.fetch("https://do/sync", { headers });
	expect(response.status).toBe(101);
	const ws = response.webSocket;
	if (!ws) {
		throw new Error("No WebSocket on 101 response");
	}
	const socket: TestSocket = { ws, messages: [], closes: [] };
	ws.accept();
	ws.addEventListener("message", (event) => {
		if (typeof event.data === "string" && event.data !== "pong") {
			socket.messages.push(JSON.parse(event.data) as ServerMessage);
		}
	});
	ws.addEventListener("close", (event) => {
		socket.closes.push({ code: event.code, reason: event.reason });
	});
	return socket;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const invalidations = (socket: TestSocket): InvalidateMessage[] =>
	socket.messages.filter(
		(message): message is InvalidateMessage => message.type === "invalidate",
	);

const presenceEvents = (socket: TestSocket): PresenceMessage[] =>
	socket.messages.filter(
		(message): message is PresenceMessage => message.type === "presence",
	);

describe("SyncChannelDO", () => {
	it("rejects non-upgrade and unidentified requests", async () => {
		const stub = env.SYNC_CHANNEL.getByName("user:reject");
		const plain = await stub.fetch("https://do/sync");
		expect(plain.status).toBe(426);

		const noIdentity = await stub.fetch("https://do/sync", {
			headers: { Upgrade: "websocket" },
		});
		expect(noIdentity.status).toBe(400);
	});

	it("broadcasts coalesced invalidations to all sockets", async () => {
		const channel = "user:u1";
		const a = await connect(channel, "u1");
		const b = await connect(channel, "u1");
		const stub = env.SYNC_CHANNEL.getByName(channel);

		// Two rapid identical publishes coalesce into one frame.
		await stub.publish({ entity: "todo", op: "update", id: "t1" });
		await stub.publish({ entity: "todo", op: "update", id: "t1" });
		// A distinct key gets its own frame.
		await stub.publish({ entity: "todo", op: "create", id: "t2" });
		await sleep(COALESCE_WAIT_MS);

		for (const socket of [a, b]) {
			const frames = invalidations(socket);
			expect(frames).toHaveLength(2);
			expect(frames.map((f) => `${f.op}:${f.id}`).sort()).toEqual([
				"create:t2",
				"update:t1",
			]);
		}
	});

	it("sends presence snapshot on connect and join/leave events", async () => {
		const channel = "org:o1";
		const a = await connect(channel, "alice");
		await sleep(10);

		const snapshotA = presenceEvents(a).find((m) => m.event === "snapshot");
		expect(snapshotA).toBeDefined();
		if (snapshotA?.event === "snapshot") {
			expect(snapshotA.members).toEqual([{ userId: "alice", connections: 1 }]);
		}

		const b = await connect(channel, "bob");
		await sleep(10);

		// Alice hears bob join; bob's own snapshot includes both users.
		const joins = presenceEvents(a).filter((m) => m.event === "join");
		expect(joins).toHaveLength(1);
		if (joins[0]?.event === "join") {
			expect(joins[0].userId).toBe("bob");
		}
		const snapshotB = presenceEvents(b).find((m) => m.event === "snapshot");
		if (snapshotB?.event === "snapshot") {
			expect(snapshotB.members).toHaveLength(2);
		}

		// Second socket for an existing user does NOT broadcast another join.
		await connect(channel, "bob");
		await sleep(10);
		expect(presenceEvents(a).filter((m) => m.event === "join")).toHaveLength(1);

		const presence = await env.SYNC_CHANNEL.getByName(channel).getPresence();
		expect(presence.sort((x, y) => x.userId.localeCompare(y.userId))).toEqual([
			{ userId: "alice", connections: 1 },
			{ userId: "bob", connections: 2 },
		]);
	});

	it("broadcasts leave when a user's last socket closes", async () => {
		const channel = "org:o2";
		const a = await connect(channel, "alice");
		const b = await connect(channel, "bob");
		await sleep(10);

		b.ws.close(1000, "bye");
		await sleep(50);

		const leaves = presenceEvents(a).filter((m) => m.event === "leave");
		expect(leaves).toHaveLength(1);
		if (leaves[0]?.event === "leave") {
			expect(leaves[0].userId).toBe("bob");
		}
	});

	it("kicks only the target user's sockets", async () => {
		const channel = "org:o3";
		const alice = await connect(channel, "alice");
		const bob = await connect(channel, "bob");
		await sleep(10);

		await env.SYNC_CHANNEL.getByName(channel).kick("bob");
		await sleep(50);

		expect(bob.closes).toHaveLength(1);
		expect(bob.closes[0]?.code).toBe(4403);
		expect(
			bob.messages.some(
				(m) => m.type === "kick" && m.reason === "membership-revoked",
			),
		).toBe(true);
		expect(alice.closes).toHaveLength(0);
		// Alice hears bob leave.
		expect(
			presenceEvents(alice).some(
				(m) => m.event === "leave" && m.userId === "bob",
			),
		).toBe(true);
	});

	it("relays client broadcasts with identity stamped from the attachment", async () => {
		const channel = "org:o4";
		const alice = await connect(channel, "alice");
		const bob = await connect(channel, "bob");
		await sleep(10);

		alice.ws.send(
			JSON.stringify({
				v: 1,
				type: "broadcast",
				topic: "typing",
				payload: { spoofed: true, from: "mallory" },
			}),
		);
		await sleep(50);

		const received = bob.messages.find((m) => m.type === "broadcast");
		expect(received).toBeDefined();
		if (received?.type === "broadcast") {
			expect(received.topic).toBe("typing");
			expect(received.from).toBe("alice"); // never the payload's claim
		}
		// Sender does not receive its own broadcast.
		expect(alice.messages.some((m) => m.type === "broadcast")).toBe(false);
	});

	it("answers presence:get with a snapshot", async () => {
		const channel = "user:u9";
		const socket = await connect(channel, "u9");
		await sleep(10);
		socket.messages.length = 0;

		socket.ws.send(JSON.stringify({ v: 1, type: "presence:get" }));
		await sleep(50);

		const snapshot = presenceEvents(socket).find((m) => m.event === "snapshot");
		expect(snapshot).toBeDefined();
	});

	it("closes sockets whose session expired via alarm", async () => {
		const channel = "user:expiring";
		const socket = await connect(channel, "expiring", Date.now() + 60);
		// The expiry alarm scheduled at connect fires on its own; just wait it out.
		await sleep(250);

		expect(socket.closes).toHaveLength(1);
		expect(socket.closes[0]?.code).toBe(4403);
		expect(
			socket.messages.some(
				(m) => m.type === "kick" && m.reason === "session-expired",
			),
		).toBe(true);
	});
});
