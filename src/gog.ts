import { z } from "zod";

export function mailSearchCmd({
	sender,
	after,
	account,
	text,
}: {
	sender: string;
	after: string;
	account: string;
	text?: string;
}): string[] {
	return [
		"gog",
		"mail",
		"search",
		`from:${sender} after:${after} ${text ? text : ""}`,
		"--account",
		account,
		"--max=10",
		"--json",
	];
}

export function mailGetCmd({
	threadId,
	account,
}: {
	threadId: string;
	account: string;
}): string[] {
	return ["gog", "mail", "get", threadId, "--account", account, "--json"];
}

export function attachmentGetCmd({
	threadId,
	attachmentId,
	account,
}: {
	threadId: string;
	attachmentId: string;
	account: string;
}): string[] {
	return [
		"gog",
		"mail",
		"attachment",
		threadId,
		attachmentId,
		"--account",
		account,
		"--json",
	];
}

export const AttachmentSchema = z
	.object({
		bytes: z.int(),
		cached: z.boolean(),
		path: z.string(),
	})
	.describe("AttachmentSchema");

export const MailSchema = z
	.object({
		attachments: z
			.array(
				z.object({
					filename: z.string(),
					size: z.int(),
					sizeHuman: z.string(),
					mimeType: z.string(),
					attachmentId: z.string(),
				}),
			)
			.nullable()
			.optional(),
	})
	.describe("MailSchema");

export const ThreadSchema = z
	.object({
		id: z.string(),
		date: z.string(),
		from: z.string(),
		subject: z.string(),
		messageCount: z.int(),
	})
	.describe("ThreadSchema");

export const ThreadListEnvelopeSchema = z
	.object({
		threads: z.array(ThreadSchema).nullable(),
	})
	.describe("ThreadListEnvelopeSchema");
