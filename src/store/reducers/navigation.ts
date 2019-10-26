import { BottomTransitionState } from '../../models/BottomTransitionState';
import { HeaderTransitionState } from '../../models/HeaderTransitionState';
import { IStation } from '../../models/StationAPI';
import { NavigationActionTypes } from '../types/navigation';

export interface INavigationState {
  leftStations: IStation[];
  headerState: HeaderTransitionState;
  bottomState: BottomTransitionState;
}

const initialState: INavigationState = {
  headerState: 'CURRENT',
  bottomState: 'LINE',
  leftStations: [],
};

const navigationReducer = (
  state = initialState,
  action: NavigationActionTypes,
): INavigationState => {
  switch (action.type) {
    case 'REFRESH_LEFT_STATIONS':
      return {
        ...state,
        leftStations: action.payload.stations,
      };
    case 'REFRESH_HEADER_STATE':
      return {
        ...state,
        headerState: action.payload.state,
      };
    case 'REFRESH_BOTTOM_STATE':
      return {
        ...state,
        bottomState: action.payload.state,
      };
    default:
      return state;
  }
};

export default navigationReducer;