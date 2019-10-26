import { LocationData } from 'expo-location';

import {
    LocationActionTypes, UPDATE_LOCATION_FAILED, UPDATE_LOCATION_START, UPDATE_LOCATION_SUCCESS,
} from '../types/location';

export const updateLocationStart = (): LocationActionTypes => ({
  type: UPDATE_LOCATION_START,
});

export const updateLocationSuccess = (location: LocationData): LocationActionTypes => ({
  type: UPDATE_LOCATION_SUCCESS,
  payload: {
    location,
  },
});

export const updateLocationFailed = (error: Error): LocationActionTypes => ({
  type: UPDATE_LOCATION_FAILED,
  payload: {
    error,
  },
});