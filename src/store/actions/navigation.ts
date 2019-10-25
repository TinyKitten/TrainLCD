import { HeaderTransitionState } from '../../models/HeaderTransitionState';
import {
    IRefreshLeftStationsPayload, NavigationActionTypes, REFRESH_HEADER_STATE, REFRESH_LEFT_STATIONS,
} from '../types/navigation';

export const refreshLeftStations = (payload: IRefreshLeftStationsPayload): NavigationActionTypes => ({
  type: REFRESH_LEFT_STATIONS,
  payload,
});

export const refreshHeaderState = (state: HeaderTransitionState): NavigationActionTypes => ({
  type: REFRESH_HEADER_STATE,
  payload: {
    state,
  },
});
