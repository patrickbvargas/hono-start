CREATE OR REPLACE FUNCTION require_active_counterparty_profile() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE pid INTEGER; eligible BOOLEAN; fk TEXT;
BEGIN
 fk:=CASE TG_TABLE_NAME WHEN 'contracts' THEN 'customerId' WHEN 'receivables' THEN 'debtorId' WHEN 'expenses' THEN 'supplierId' ELSE 'beneficiaryId' END;
 pid:=(to_jsonb(NEW)->>fk)::INTEGER;
 IF TG_OP='UPDATE' AND (to_jsonb(NEW)->>fk) IS NOT DISTINCT FROM (to_jsonb(OLD)->>fk) THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME IN ('contracts','receivables') THEN
 SELECT s."isActive" AND p."isActive" AND p."deletedAt" IS NULL INTO eligible FROM client_profiles s JOIN people p ON p.id=s."personId" WHERE s.id=pid;
 ELSE
 SELECT s."isActive" AND p."isActive" AND p."deletedAt" IS NULL INTO eligible FROM supplier_profiles s JOIN people p ON p.id=s."personId" WHERE s.id=pid;
 END IF;
 IF eligible IS NOT TRUE THEN RAISE EXCEPTION 'Active counterparty profile required'; END IF;
 RETURN NEW;
END $$;
