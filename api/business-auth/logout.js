import { dispatch } from '../../business/auth-server.js';

export default function handler(request) {
  return dispatch(request, 'logout');
}
