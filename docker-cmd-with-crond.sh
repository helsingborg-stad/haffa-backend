# Start crond
CROND=`ps -ef -o args | egrep "^crond$" | wc -l`

if [ ${CROND} -eq 0 ]; then
  echo "Starting crond"
  crond
else
  echo "crond already running"
fi
# Update crontab
crontab -l | grep -v "daily.sh" | { cat; echo "0 23 * * * /usr/src/app/data/jobs/daily.sh>/tmp/daily.log"; } | crontab -

# Run application
node ./index.js
