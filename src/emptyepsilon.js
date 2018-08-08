require('dotenv').config({ silent: true });
import logger from 'signale';
import { get } from 'axios';
import { set } from 'lodash';

const { EMPTY_EPSILON_HOST, EMPTY_EPSILON_PORT } = process.env;
const URL = `http://${EMPTY_EPSILON_HOST}:${EMPTY_EPSILON_PORT}`;
const GET_URL = `${URL}/get.lua`;

const systems = [
  'reactor',
  'beamweapons',
  'missilesystem',
  'maneuver',
  'impulse',
  'warp',
  'jumpdrive',
  'frontshield',
  'rearshield'
];
const weapons = ['homing', 'nuke', 'mine', 'emp', 'hvli'];

const createRequestParameters = configs =>
  configs.reduce((previous, next) => 
    next.targets.reduce((p, n) => {
      const obj = Object.assign({}, p);
      obj[n + next.keySuffix] = `${next.command}(\"${n}\")`;
      return obj;
    }, previous), {});

const requestParameters = createRequestParameters([
  { keySuffix: 'Count', command: 'getWeaponStorage', targets: weapons },
  { keySuffix: 'Health', command: 'getSystemHealth', targets: systems },
  { keySuffix: 'Heat', command: 'getSystemHeat', targets: systems }
]);

export const getGameState = () => {
  return get(GET_URL, { params: requestParameters }).then((res, err) => {
    if (err) throw new Error(err);
    return Object.keys(res.data).reduce((data, key) => {
      let keyPrefix;
      if (key.includes('Health')) keyPrefix = 'systems.health';
      else if (key.includes('Heat')) keyPrefix = 'systems.heat';
      return set(data, `${keyPrefix || 'weapons'}.${key}`, res.data[key]);
    }, {});
  });
};
