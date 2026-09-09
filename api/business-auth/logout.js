import { nodeHandler } from '../../business/auth-server.js';

export default function handler(req, res) {
  return nodeHandler(req, res, 'logout');
}
