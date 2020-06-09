CREATE SCHEMA IF NOT EXISTS helm;

CREATE TABLE IF NOT EXISTS helm."PendingPatientConsent"
(
    "Identifier" character(10) UNIQUE COLLATE pg_catalog."default" NOT NULL,
    "Resource" json,
    "FullUrl" text,
    "Id" SERIAL PRIMARY KEY
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;
