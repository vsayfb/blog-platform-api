#!/bin/bash
set -e

psql -U ${POSTGRES_USER} <<-EOSQL
    CREATE DATABASE ${POSTGRES_DB_NAME};
    ALTER USER ${POSTGRES_USER} WITH PASSWORD ${POSTGRES_PASSWORD};
EOSQL
