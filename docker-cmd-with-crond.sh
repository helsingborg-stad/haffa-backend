# Start crond
CROND=`ps -ef -o args | egrep "^crond$" | wc -l`

if [ ${CROND} -eq 0 ]; then
  echo "Starting crond"
  crond
else
  echo "crond already running"
fi
# Update crontab
crontab -l | grep -v "daily.sh" | { cat; echo "0 06 * * * /usr/src/app/data/jobs/daily.sh>/tmp/daily.log"; } | crontab -

cd /usr/src/app
npm install --platform=linuxmusl --arch=x64 sharp

# Run application
node ./index.js
