#!/bin/bash
if [ -f latest.dump ]; then
  rm latest.dump
fi
heroku pg:backups:capture --app film-movement
heroku pg:backups:download --app film-movement
pg_restore --verbose --clean --no-acl --no-owner -h localhost -d film-manager_development latest.dump
rm latest.dump
echo Production Database Imported!
