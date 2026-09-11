import * as path from 'path';

// files written (or failed to write) by a download echo back through the file
// watcher as create/change/delete events; those must never bounce back to the remote
const ECHO_WINDOW = 5000;
const recent = new Map<string, number>();
const activeRoots = new Set<string>();

export function markDownloadedLocally(fsPath: string) {
  recent.set(fsPath, Date.now());
}

export function beginDownload(rootFsPath: string): () => void {
  activeRoots.add(rootFsPath);
  return () => {
    activeRoots.delete(rootFsPath);
    markDownloadedLocally(rootFsPath);
  };
}

function covers(downloaded: string, fsPath: string, prefix: string) {
  return (
    downloaded === fsPath ||
    downloaded.startsWith(prefix) ||
    fsPath.startsWith(downloaded + path.sep)
  );
}

export function isDownloadEcho(fsPath: string): boolean {
  const prefix = fsPath + path.sep;
  for (const root of activeRoots) {
    if (covers(root, fsPath, prefix)) {
      return true;
    }
  }
  const now = Date.now();
  for (const [downloaded, at] of recent) {
    if (now - at > ECHO_WINDOW) {
      recent.delete(downloaded);
      continue;
    }
    if (covers(downloaded, fsPath, prefix)) {
      return true;
    }
  }
  return false;
}
