import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { AppState } from '../';
import { BAD_ACCURACY_THRESHOLD } from '../../constants';
import { updateBadAccuracy, updateLocationFailed, updateLocationSuccess } from './location';
import { fetchStationStart } from './station';

export const ERR_LOCATION_REJECTED = 'ERR_LOCATION_REJECTED';

const askPermission = async () => {
  const { status } = await Permissions.askAsync(Permissions.LOCATION);
  if (status !== 'granted') {
    return Promise.reject(ERR_LOCATION_REJECTED);
  }
};

export const updateLocationAsync = (): ThunkAction<void, AppState, null, Action<string>> => async (dispatch) => {
  dispatch(fetchStationStart());
  try {
    await askPermission();
    Location.watchPositionAsync({
      accuracy: Location.Accuracy.High,
    }, (data) => {
      dispatch(updateLocationSuccess(data));
      if (data.coords.accuracy > BAD_ACCURACY_THRESHOLD) {
        dispatch(updateBadAccuracy(true));
      } else {
        dispatch(updateBadAccuracy(false));
      }
    });
  } catch (e) {
    dispatch(updateLocationFailed(e));
  }
};
