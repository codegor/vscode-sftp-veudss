import * as output from '../ui/output';
import logger from '../logger';
import { showErrorMessage } from '../host';

export function reportError(err: Error | string, ctx?: string) {
  let errorString: string;
  if (err instanceof Error) {
    errorString = err.message;
    logger.error(`${err.stack}`, ctx);
  } else {
    errorString = err;
    logger.error(errorString, ctx);
  }

  showErrorMessage(errorString, 'Detail').then(result => {
    if (result === 'Detail') {
      output.show();
    }
  });
  return;
}

export function isNotFoundError(error: any): boolean {
  if (!error) {
    return false;
  }
  // local: ENOENT, sftp: SSH_FX_NO_SUCH_FILE (2), ftp: 550
  if (error.code === 'ENOENT' || error.code === 2 || error.code === 550) {
    return true;
  }
  return /no such file|not found|does not exist|file unavailable/i.test(
    String(error.message || error)
  );
}
