import { LocationData } from 'expo-location';
import React, { Dispatch } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

import Button from '../../components/Button';
import FAB from '../../components/FAB';
import { ILine, IStation } from '../../models/StationAPI';
import { AppState } from '../../store';
import { fetchStationAsync } from '../../store/actions/stationAsync';

interface IProps {
  station: IStation;
  location: LocationData;
  onLineSelected: (line: ILine) => void;
  fetchStation: (location: LocationData) => Promise<void>;
}

const styles = StyleSheet.create({
  bottom: {
    padding: 24,
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },
  buttons: {
    marginTop: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  button: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 12,
  },
});

const SelectLine = ({
  station,
  onLineSelected,
  fetchStation,
  location,
}: IProps) => {
  const onLineButtonPress = (line: ILine) => onLineSelected(line);

  const renderLineButton = (line: ILine) => (
    <Button
      text={line.name}
      color={`#${line.lineColorC}`}
      key={line.id}
      style={styles.button}
      onPress={onLineButtonPress.bind(this, line)}
    />
  );

  const handleForceRefresh = () => fetchStation(location);

  return (
    <>
      <ScrollView contentContainerStyle={styles.bottom}>
        <Text style={styles.headingText}>路線を選択してください</Text>

        <View style={styles.buttons}>
          {station.lines.map((line) => renderLineButton(line))}
        </View>
      </ScrollView>
      <FAB onPress={handleForceRefresh} />
    </>
  );
};

const mapStateToProps = (state: AppState) => ({
  station: state.station.station,
  location: state.location.location,
});

const mapDispatchToProps = (dispatch: Dispatch<any>) => ({
  fetchStation: (location: LocationData) =>
    dispatch(fetchStationAsync(location)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SelectLine);
