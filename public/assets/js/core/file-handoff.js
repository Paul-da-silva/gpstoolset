/**
 * Hands one File from the home drop zone to a viewer.
 * The File stays in this browser (IndexedDB). It is not uploaded.
 * The viewer takes it once, then the copy is removed.
 */
var DB_NAME = 'gpstoolset.handoff';
var STORE = 'files';
var KEY = 'pending';
var MAX_AGE_MS = 2 * 60 * 1000;
var MAX_BYTES = 64 * 1024 * 1024;

function tooLarge(file) {
  return !!(file && file.size > MAX_BYTES);
}

function openDb() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    var req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = function () {
      resolve(req.result);
    };
    req.onerror = function () {
      reject(req.error || new Error('Could not open handoff storage'));
    };
  });
}

function txDone(tx) {
  return new Promise(function (resolve, reject) {
    tx.oncomplete = function () {
      resolve();
    };
    tx.onerror = function () {
      reject(tx.error || new Error('Handoff failed'));
    };
    tx.onabort = function () {
      reject(tx.error || new Error('Handoff aborted'));
    };
  });
}

export function stash(file, slug) {
  if (tooLarge(file)) {
    return Promise.reject(new Error('That file is larger than 64 MB.'));
  }
  return openDb().then(function (db) {
    var tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({
      blob: file,
      name: file.name || 'file',
      type: file.type || '',
      slug: slug,
      at: Date.now()
    }, KEY);
    return txDone(tx).then(function () {
      db.close();
    });
  });
}

export function take(slug) {
  return openDb().then(function (db) {
    var tx = db.transaction(STORE, 'readwrite');
    var store = tx.objectStore(STORE);
    var got = new Promise(function (resolve, reject) {
      var req = store.get(KEY);
      req.onerror = function () {
        reject(req.error || new Error('Could not read handoff'));
      };
      req.onsuccess = function () {
        var row = req.result;
        if (!row) {
          resolve(null);
          return;
        }
        var blob = row.blob;
        var fresh = (Date.now() - row.at) <= MAX_AGE_MS;
        var oversized = tooLarge(blob);
        var mine = fresh && !oversized && row.slug === slug;
        if (!fresh || mine || oversized) {
          store.delete(KEY);
        }
        if (!mine || !blob) {
          resolve(null);
          return;
        }
        if (blob instanceof File && blob.name) {
          resolve(blob);
          return;
        }
        resolve(new File([blob], row.name || 'file', {
          type: row.type || blob.type || ''
        }));
      };
    });
    return got.then(function (file) {
      return txDone(tx).then(function () {
        db.close();
        return file;
      });
    }, function (err) {
      db.close();
      throw err;
    });
  }).catch(function () {
    return null;
  });
}
