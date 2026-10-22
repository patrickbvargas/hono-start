ALTER TABLE "firms" RENAME COLUMN "clerkOrganizationId" TO "clerkOrgId";
ALTER INDEX "firms_clerkOrganizationId_key" RENAME TO "firms_clerkOrgId_key";
