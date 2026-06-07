/**
 * Full-jitter exponential backoff: a random delay in
 * [0, min(maxMs, baseMs * 2^attempt)]. Jitter prevents reconnect stampedes
 * after a deploy or network blip.
 */
export function fullJitterBackoff(
	attempt: number,
	baseMs: number,
	maxMs: number,
): number {
	const ceiling = Math.min(maxMs, baseMs * 2 ** attempt);
	return Math.random() * ceiling;
}
