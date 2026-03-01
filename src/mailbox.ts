import type { z } from "zod";
import path from "node:path";

import { outFilesDirectory, queries } from "../config";
import {
	attachmentGetCmd,
	AttachmentSchema,
	mailGetCmd,
	MailSchema,
	mailSearchCmd,
	ThreadListEnvelopeSchema,
	type ThreadSchema,
} from "./gog";

const threads: Map<string, z.infer<typeof ThreadSchema> & { account: string }> =
	new Map();
const promises: Promise<void>[] = [];

for (const query of queries) {
	const { senders, accounts, after, text } = query;

	for (const sender of senders) {
		for (const account of accounts) {
			promises.push(
				(async () => {
					console.log(
						`[${account}] Looking for ${sender} after ${after} ${text ? `with "${text}"` : ""}...`,
					);

					const parsed = await runGogAndParse(
						ThreadListEnvelopeSchema,
						mailSearchCmd({ sender, after, account, text }),
					);

					if (parsed.data?.threads) {
						const newThreads = parsed.data.threads.map((t) => ({
							...t,
							account,
						}));

						newThreads.forEach((t) => {
							threads.set(t.id, t);
						});

						console.log(
							`[${account}] Found ${newThreads.length} from ${sender}.`,
						);
					} else {
						console.log(`[${account}] None found from ${sender}.`);
					}
				})(),
			);
		}
	}
}

await Promise.all(promises);
promises.splice(0);

for (const thread of threads.values()) {
	promises.push(
		(async () => {
			console.log(
				`[${thread.account}] Getting "${thread.subject}" from ${thread.from} at ${thread.date}...`,
			);

			const parsed = await runGogAndParse(
				MailSchema,
				mailGetCmd({ threadId: thread.id, account: thread.account }),
			);

			if (parsed.data?.attachments?.length) {
				const pdfs = parsed.data.attachments.filter((a) =>
					a.mimeType.includes("pdf"),
				);

				console.log(
					`[${thread.account}] Got "${thread.subject}" from ${thread.from} at ${thread.date}: ${parsed.data.attachments.length} attachments, ${pdfs.length} PDFs.`,
				);

				for (const attachment of pdfs) {
					console.log(
						`[${thread.account}] Downloading ${attachment.filename} from ${thread.from} at ${thread.date}...`,
					);

					const parsed = await runGogAndParse(
						AttachmentSchema,
						attachmentGetCmd({
							threadId: thread.id,
							attachmentId: attachment.attachmentId,
							account: thread.account,
						}),
					);

					const inputFile = Bun.file(parsed.data.path);
					const outFile = Bun.file(
						path.join(outFilesDirectory, attachment.filename),
					);

					Bun.write(outFile, inputFile);
				}
			} else {
				console.log(
					`[${thread.account}] Got "${thread.subject}" from ${thread.from} at ${thread.date}: no attachments.`,
				);
			}
		})(),
	);
}

// helpers
async function runGogAndParse<Schema extends z.Schema>(
	schema: Schema,
	cmd: string[],
): Promise<z.ZodSafeParseSuccess<z.output<Schema>>> {
	const proc = Bun.spawn(cmd);
	const out = await new Response(proc.stdout).text();
	const parsed = schema.safeParse(JSON.parse(out));

	if (parsed.error) {
		console.error(
			`parse gog output for ${schema.description}: ${parsed.error}`,
		);
		process.exit(1);
	}

	return parsed;
}
