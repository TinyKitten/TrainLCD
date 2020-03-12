import * as Location from 'expo-location';
import gql from 'graphql-tag';
import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {TrainLCDAppState} from '../';
import client from '../../api/apollo';
import {getApproachingThreshold, getArrivedThreshold} from '../../constants';
import {
  ILine, IStation, IStationByCoordsData, IStationsByLineIdData,
} from '../../models/StationAPI';
import {calcHubenyDistance} from '../../utils/hubeny';
import {
  fetchStationFailed, fetchStationListFailed, fetchStationListStart, fetchStationListSuccess,
  fetchStationStart, fetchStationSuccess, refreshNearestStation, updateApproaching, updateArrived,
  updateScoredStations,
} from './station';

export const ERR_LOCATION_REJECTED = 'ERR_LOCATION_REJECTED';

export const fetchStationAsync = (
  location: Location.LocationData,
): ThunkAction<void, TrainLCDAppState, null, Action<string>> => async (dispatch) => {
  const {coords} = location;
  const {latitude, longitude} = coords;
  dispatch(fetchStationStart());
  try {
    const result = await client.query({
      query: gql`
        {
          stationByCoords(latitude: ${latitude}, longitude: ${longitude}) {
            groupId
            name
            nameK
            address
            distance
            latitude
            longitude
            lines {
              id
              companyId
              lineColorC
              name
              nameK
              lineType
            }
          }
        }
      `,
    });
    if (result.errors) {
      dispatch(fetchStationFailed(result.errors[0]));
      return;
    }
    const data = result.data as IStationByCoordsData;
    dispatch(fetchStationSuccess(data.stationByCoords));
  } catch (e) {
    dispatch(fetchStationFailed(e));
  }
};

export const fetchStationListAsync = (
  lineId: number,
): ThunkAction<void, TrainLCDAppState, null, Action<string>> => async (dispatch) => {
  dispatch(fetchStationListStart());
  try {
    const result = await client.query({
      query: gql`
        {
          stationsByLineId(lineId: ${lineId}) {
            groupId
            name
            nameK
            address
            latitude
            longitude
            lines {
              id
              companyId
              lineColorC
              name
              nameK
              lineType
            }
          }
        }
      `,
    });
    if (result.errors) {
      dispatch(fetchStationFailed(result.errors[0]));
      return;
    }
    const data = result.data as IStationsByLineIdData;
    dispatch(fetchStationListSuccess(data.stationsByLineId));
  } catch (e) {
    dispatch(fetchStationListFailed(e));
  }
};

const isArrived = (nearestStation: IStation, currentLine: ILine) => {
  if (!nearestStation) {
    return false;
  }
  const ARRIVED_THRESHOLD = getArrivedThreshold(currentLine.lineType);
  return nearestStation.distance < ARRIVED_THRESHOLD;
};

const isApproaching = (nextStation: IStation, nearestStation: IStation, currentLine: ILine) => {
  if (!nextStation) {
    return false;
  }
  const APPROACHING_THRESHOLD = getApproachingThreshold(currentLine.lineType);
  // APPROACHING_THRESHOLD以上次の駅から離れている: つぎは
  // APPROACHING_THRESHOLDより近い: まもなく
  return (
    nearestStation.distance < APPROACHING_THRESHOLD &&
    nearestStation.groupId === nextStation.groupId
  );
};

const getRefreshConditions = (station: IStation, currentLine: ILine) =>
  station.distance < getArrivedThreshold(currentLine.lineType);

const calcStationDistances = (
  stations: IStation[],
  latitude: number,
  longitude: number,
): IStation[] => {
  const scored = stations.map((station) => {
    const distance = calcHubenyDistance(
      {latitude, longitude},
      {latitude: station.latitude, longitude: station.longitude},
    );
    return {...station, distance};
  });
  scored.sort((a, b) => {
    if (a.distance < b.distance) {
      return -1;
    }
    if (a.distance > b.distance) {
      return 1;
    }
    return 0;
  });
  return scored;
};

export const updateScoredStationsAsync = (
  location: Location.LocationData,
): ThunkAction<void, TrainLCDAppState, null, Action<string>> => async (
  dispatch,
  getState,
) => {
  const {stations} = getState().station;
  const {latitude, longitude} = location.coords;
  const scoredStations = calcStationDistances(stations, latitude, longitude);
  dispatch(updateScoredStations(scoredStations));
};

export const refreshNearestStationAsync = (
  location: Location.LocationData,
): ThunkAction<void, TrainLCDAppState, null, Action<string>> => async (
  dispatch,
  getState,
) => {
  const {stations} = getState().station;
  const {selectedLine} = getState().line;
  const {leftStations} = getState().navigation;
  const {latitude, longitude} = location.coords;
  const scoredStations = calcStationDistances(stations, latitude, longitude);
  const nearestStation = scoredStations[0];
  const arrived = isArrived(nearestStation, selectedLine);
  const approaching = isApproaching(leftStations[1], nearestStation, selectedLine);
  const conditionPassed = getRefreshConditions(nearestStation, selectedLine);
  dispatch(updateScoredStations(scoredStations));
  dispatch(updateArrived(arrived));
  dispatch(updateApproaching(approaching));
  if (conditionPassed) {
    dispatch(refreshNearestStation(nearestStation));
  }
};
