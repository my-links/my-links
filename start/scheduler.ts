import scheduler from 'adonisjs-scheduler/services/main';

scheduler.command('remove:inactive-users').cron('0 20 * * *');
