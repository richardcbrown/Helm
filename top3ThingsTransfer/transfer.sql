-- SCHEMA: transfer

DROP SCHEMA transfer CASCADE;

CREATE SCHEMA transfer AUTHORIZATION postgres;
	
CREATE TABLE transfer.transferdata ("NhsNumber" TEXT NOT NULL, "EcisTopThreeThings" JSON NOT NULL, "Id" TEXT NOT NULL);

INSERT INTO transfer.transferdata (SELECT party.party_ref_value AS NhsNumber, entry.entry AS EcisTopThreeThings, CAST(entry.id AS TEXT) AS Id FROM ehr.entry entry INNER JOIN ehr.composition composition ON composition.id = entry.composition_id INNER JOIN ehr.ehr ehr ON ehr.id = composition.ehr_id INNER JOIN ehr.status status ON status.ehr_id = ehr.id INNER JOIN ehr.party_identified party ON party.id = party WHERE entry.template_id = 'IDCR - Top3issues.v0');