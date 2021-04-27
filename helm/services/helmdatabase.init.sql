CREATE SCHEMA IF NOT EXISTS helm;

CREATE TABLE IF NOT EXISTS helm."Users"
(
    "Id" SERIAL PRIMARY KEY,
    "NhsNumber" TEXT NOT NULL,
    "Reference" TEXT NULL,
    "LastLogin" TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT UNIQ_NHSNUMBER UNIQUE("NhsNumber"),
    CONSTRAINT UNIQ_REFERENCE UNIQUE("Reference")
)
WITH (OIDS = FALSE)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS helm."UserPreferences"
(
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL,
    "Preferences" JSON NOT NULL DEFAULT '{}',
    CONSTRAINT FK_USERPREFERENCES_USERS
    FOREIGN KEY ("UserId") 
    REFERENCES helm."Users"("Id")
    ON DELETE CASCADE,
    CONSTRAINT UNIQ_USERID UNIQUE("UserId") 
);

CREATE TABLE IF NOT EXISTS helm."TokenIds"
(
  "Id" SERIAL PRIMARY KEY,
  "UserId" INTEGER NULL,
  "Jti" TEXT NOT NULL,
  "Issued" INTEGER NOT NULL,
  "Expires" INTEGER NOT NULL,
  "Revoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "CurrentPage" TEXT NULL,
  "TotalPages" INTEGER NOT NULL DEFAULT 0,
  "PageViewStart" TIMESTAMP WITH TIME ZONE NULL,
  "LastActive" INTEGER NULL,
  CONSTRAINT FK_TOKENIDS_USERS
  FOREIGN KEY ("UserId") 
  REFERENCES helm."Users"("Id")
  ON DELETE CASCADE 
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