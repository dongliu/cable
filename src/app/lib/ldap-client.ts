import * as ldap from 'ldapjs';

import { info } from '../shared/logging';

interface ADConfig {
  url: string;
  adminDn: string;
  adminPassword: string;
}

export let client: ldap.Client;

let ad: ADConfig;

export function setADConfig(config: ADConfig) {
  ad = config;
  client = ldap.createClient({
    url: ad.url,
    // maxConnections: 5,
    connectTimeout: 10 * 1000,
    timeout: 15 * 1000,
    bindDN: ad.adminDn,
    bindCredentials: ad.adminPassword,
  });
}

export function search(base: string, opts: ldap.SearchOptions, raw: boolean, cb: (err: any, entry?: any[]) => void) {
  client.search(base, opts, (err, result) => {
    if (err) {
      info(JSON.stringify(err));
      return cb(err);
    }
    const items: any[] = [];
    result.on('searchEntry', (entry) => {
      if (raw) {
        items.push(entry.raw);
      } else {
        items.push(entry.object);
      }
    });
    result.on('error', (err0) => {
      info(JSON.stringify(err0));
      return cb(err0);
    });
    result.on('end', (result0) => {
      if (result0.status !== 0) {
        const err0 = 'non-zero status from LDAP search: ' + result0.status;
        info(JSON.stringify(err0));
        return cb(err0);
      }
      switch (items.length) {
      case 0:
        return cb(null, []);
      default:
        return cb(null, items);
      }
    });
  });
}
