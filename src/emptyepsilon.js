require('dotenv').config({ silent: true });
import logger from 'signale';
import axios from 'axios';
import { get, set } from 'lodash';

const { EMPTY_EPSILON_HOST, EMPTY_EPSILON_PORT } = process.env;
const URL = `http://${EMPTY_EPSILON_HOST}:${EMPTY_EPSILON_PORT}`;
const GET_URL = `${URL}/get.lua`;
const SET_URL = `${URL}/set.lua`;

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

export const setGameState = (command, target, value) => {
  // Only allow known commands to be used
  if (!['setSystemHealth', 'setSystemHeat', 'setWeaponStorage'].includes(command))
    return Promise.reject('Invalid command', command);
  return axios.get(`${SET_URL}?${command}("${target}",${value})`).then(res => {
    if (get(res, 'data.ERROR')) throw new Error(res.data.ERROR);
    logger.success('Empty Epsilon game state set', command, target, value);
    return res;
  });
}

export const getGameState = () => {
  return axios.get(GET_URL, { params: requestParameters }).then((res, err) => {
    if (err) throw new Error(err);
    return Object.keys(res.data).reduce((data, key) => {
      let keyPrefix;
      if (key.includes('Health')) keyPrefix = 'systems.health';
      else if (key.includes('Heat')) keyPrefix = 'systems.heat';
      return set(data, `${keyPrefix || 'weapons'}.${key}`, res.data[key]);
    }, {});
  });
};
