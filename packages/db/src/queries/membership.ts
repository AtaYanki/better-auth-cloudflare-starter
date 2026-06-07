import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { member } from "../schema/auth";

/** Whether the user is currently a member of the organization. */
export async function isOrgMember(
	organizationId: string,
	userId: string,
): Promise<boolean> {
	const rows = await db
		.select({ id: member.id })
		.from(member)
		.where(
			and(eq(member.organizationId, organizationId), eq(member.userId, userId)),
		)
		.limit(1);
	return rows.length > 0;
}
