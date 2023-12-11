# Start crond
crond

# Update crontab
crontab -l | { cat; echo "0 23 * * * /usr/src/app/data/jobs/daily.sh>/tmp/daily.log"; } | crontab -

# Run application
node ./index.js
