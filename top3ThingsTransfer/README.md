Log into DB server

sudo -i
su postgres

psql -U postgres -d ethercis

run sql commands

pg_dump -U postgres -d ethercis --format=plain --no-owner --no-acl --schema=transfer -n transfer > transfer.bak

transfer backup to bucket

import data from bucket to SQL instance