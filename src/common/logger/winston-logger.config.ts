import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonLoggerConfig: winston.LoggerOptions = {
  transports: [
    // Affiche dans la console (avec les couleurs)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('Verstack.io', {
          prettyPrint: true,
        }),
      ),
    }),
    // Sauvegarde les erreurs dans logs/error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // Sauvegarde tous les logs dans logs/combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
};
