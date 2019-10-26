import { BottomTransitionState } from '../../models/BottomTransitionState';
import { HeaderTransitionState } from '../../models/HeaderTransitionState';
import { IStation } from '../../models/StationAPI';

export const REFRESH_LEFT_STATIONS = 'REFRESH_LEFT_STATIONS';
export const REFRESH_HEADER_STATE = 'REFRESH_HEADER_STATE';
export const REFRESH_BOTTOM_STATE = 'REFRESH_BOTTOM_STATE';

export interface IRefreshLeftStationsPayload {
  stations: IStation[];
}

interface IRefreshLeftStationsAction {
  type: typeof REFRESH_LEFT_STATIONS;
  payload: IRefreshLeftStationsPayload;
}

interface IRefreshHeaderStatePayload {
  state: HeaderTransitionState;
}

interface IRefreshHeaderStateAction {
  type: typeof REFRESH_HEADER_STATE;
  payload: IRefreshHeaderStatePayload;
}

interface IRefreshBottomrStatePayload {
  state: BottomTransitionState;
}

interface IRefrehBottomStateAction {
  type: typeof REFRESH_BOTTOM_STATE;
  payload: IRefreshBottomrStatePayload;
}

export type NavigationActionTypes =
  | IRefreshLeftStationsAction
  | IRefreshHeaderStateAction
  | IRefrehBottomStateAction;
