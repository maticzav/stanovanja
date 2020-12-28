#!/bin/bash

echo "DB url: $DATABASE_URL"
export POSTGRESQL_URL="${DATABASE_URL/postgres\:\/\//postgresql://}?sslaccept=accept_invalid_certs"
echo "Fixed URL: $POSTGRESQL_URL"

yarn prisma migrate deploy --preview-feature