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

CREATE TABLE IF NOT EXISTS helm."Session"
(
    "Id" text PRIMARY KEY,
    "Uid" text NOT NULL,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."AccessToken"
(
    "Id" text PRIMARY KEY,
    "GrantId" text NOT NULL,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."AuthorizationCode"
(
    "Id" text PRIMARY KEY,
    "GrantId" text NOT NULL,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."RefreshToken"
(
    "Id" text PRIMARY KEY,
    "GrantId" text NOT NULL,
    "UserCode" text NOT NULL,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."DeviceCode"
(
    "Id" text PRIMARY KEY,
    "GrantId" text NOT NULL,
    "UserCode" text NOT NULL,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."ClientCredentials"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."Client"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."InitialAccessToken"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."RegistrationAccessToken"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."Interaction"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."ReplayDetection"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."PushedAuthorizationRequest"
(
    "Id" text PRIMARY KEY,
    "Data" json NOT NULL,
    "ExpiresAt" TIMESTAMP WITH TIME ZONE NULL,
    "ConsumedAt" TIMESTAMP WITH TIME ZONE NULL
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;