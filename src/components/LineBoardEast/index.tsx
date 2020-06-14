import { LinearGradient } from 'expo-linear-gradient';
import i18n from 'i18n-js';
import React, { useState, useCallback, memo } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  PlatformIOSStatic,
  StyleProp,
  TextStyle,
} from 'react-native';

import { Line, Station } from '../../models/StationAPI';
import Chevron from '../Chevron';
import { getLineMark } from '../../lineMark';
import { filterWithoutCurrentLine } from '../../utils/line';
import TransferLineMark from '../TransferLineMark';
import TransferLineDot from '../TransferLineDot';
import omitJRLinesIfThresholdExceeded from '../../utils/jr';

interface Props {
  arrived: boolean;
  line: Line;
  stations: Station[];
}

const { isPad } = Platform as PlatformIOSStatic;

const LineBoardEast: React.FC<Props> = ({ arrived, stations, line }: Props) => {
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get('window').width
  );
  const [windowHeight, setWindowHeight] = useState(
    Dimensions.get('window').height
  );

  const isJaLocale = i18n.locale === 'ja';

  const onLayout = (): void => {
    setWindowWidth(Dimensions.get('window').width);
    setWindowHeight(Dimensions.get('window').height);
  };

  const getStationNameEnLineHeight = useCallback((): number => {
    if (Platform.OS === 'android') {
      return 24;
    }
    if (isPad) {
      return 28;
    }
    return 21;
  }, []);

  const getStationNameEnExtraStyle = useCallback((isLast: boolean): StyleProp<
    TextStyle
  > => {
    if (!isPad) {
      return {
        width: 200,
        marginBottom: 70,
      };
    }
    if (isLast) {
      return {
        width: 200,
        marginBottom: 70,
      };
    }
    return {
      width: 250,
      marginBottom: 96,
    };
  }, []);

  const stationNameEnLineHeight = getStationNameEnLineHeight();

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      height: windowHeight,
      bottom: isPad ? windowHeight / 2.5 : undefined,
    },
    bar: {
      position: 'absolute',
      bottom: 32,
      width: isPad ? windowWidth - 72 : windowWidth - 48,
      height: isPad ? 48 : 32,
    },
    barTerminal: {
      left: isPad ? windowWidth - 72 + 6 : windowWidth - 48 + 6,
      position: 'absolute',
      width: 0,
      height: 0,
      bottom: 32,
      backgroundColor: 'transparent',
      borderStyle: 'solid',
      borderLeftWidth: isPad ? 24 : 16,
      borderRightWidth: isPad ? 24 : 16,
      borderBottomWidth: isPad ? 48 : 32,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      transform: [{ rotate: '90deg' }],
      margin: 0,
      marginLeft: -6,
      borderWidth: 0,
      borderBottomColor: `#${line.lineColorC}`,
    },
    stationNameWrapper: {
      flexDirection: 'row',
      justifyContent: isPad ? 'space-between' : undefined,
      marginLeft: 32,
      flex: 1,
    },
    stationNameContainer: {
      width: windowWidth / 9,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      bottom: isPad ? 84 : undefined,
      paddingBottom: !isPad ? 84 : undefined,
    },
    stationName: {
      width: isPad ? 48 : 32,
      textAlign: 'center',
      fontSize: isPad ? 32 : 21,
      lineHeight: stationNameEnLineHeight,
      fontWeight: 'bold',
    },
    stationNameEn: {
      fontSize: isPad ? 28 : 21,
      lineHeight: stationNameEnLineHeight,
      transform: [{ rotate: '-55deg' }],
      fontWeight: 'bold',
      marginLeft: -30,
    },
    grayColor: {
      color: '#ccc',
    },
    rotatedStationName: {
      width: 'auto',
      transform: [{ rotate: '-55deg' }],
      marginBottom: 8,
      paddingBottom: 0,
      fontSize: 21,
    },
    lineDot: {
      width: isPad ? 48 : 32,
      height: isPad ? 36 : 24,
      position: 'absolute',
      zIndex: 9999,
      bottom: isPad ? -46 : 32 + 4,
      overflow: 'visible',
    },
    chevron: {
      marginLeft: isPad ? 57 : 38,
      width: isPad ? 48 : 32,
      height: isPad ? 36 : 24,
    },
    chevronArrived: {
      marginLeft: 0,
    },
  });

  const includesLongStatioName = !!stations.filter(
    (s) => s.name.includes('ー') || s.name.length > 6
  ).length;

  interface StationNameProps {
    station: Station;
    en?: boolean;
    horizonal?: boolean;
    passed?: boolean;
    index: number;
  }

  const StationName: React.FC<StationNameProps> = ({
    station,
    en,
    horizonal,
    passed,
    index,
  }: StationNameProps) => {
    if (en) {
      return (
        <Text
          style={[
            styles.stationNameEn,
            getStationNameEnExtraStyle(index === stations.length - 1),
            passed ? styles.grayColor : null,
          ]}
        >
          {station.nameR}
        </Text>
      );
    }
    if (horizonal) {
      return (
        <Text
          style={[
            styles.stationNameEn,
            getStationNameEnExtraStyle(index === stations.length - 1),
            passed ? styles.grayColor : null,
          ]}
        >
          {station.name}
        </Text>
      );
    }
    return (
      <>
        {station.name.split('').map((c, j) => (
          <Text
            style={[styles.stationName, passed ? styles.grayColor : null]}
            key={`${j + 1}${c}`}
          >
            {c}
          </Text>
        ))}
      </>
    );
  };

  interface StationNamesWrapperProps {
    station: Station;
    passed: boolean;
    index: number;
  }

  const StationNamesWrapper: React.FC<StationNamesWrapperProps> = ({
    station,
    passed,
    index,
  }: StationNamesWrapperProps) => {
    return (
      <StationName
        station={station}
        en={!isJaLocale}
        horizonal={includesLongStatioName}
        passed={passed}
        index={index}
      />
    );
  };

  interface StationNameCellProps {
    station: Station;
    index: number;
  }

  const StationNameCell: React.FC<StationNameCellProps> = ({
    station,
    index,
  }: StationNameCellProps) => {
    const passed = !index && !arrived;
    const transferLines = filterWithoutCurrentLine(stations, line, index);
    const omittedTransferLines = omitJRLinesIfThresholdExceeded(transferLines);
    const lineMarks = omittedTransferLines.map((l) => getLineMark(l));
    const getLocalizedLineName = useCallback((l: Line) => {
      if (i18n.locale === 'ja') {
        return l.name;
      }
      return l.nameR;
    }, []);

    const PadLineMarks: React.FC = () => {
      if (!isPad) {
        return <></>;
      }
      const padLineMarksStyle = StyleSheet.create({
        root: {
          marginTop: 4,
        },
        lineMarkWrapper: {
          marginTop: 4,
          width: windowWidth / 10,
          flexDirection: 'row',
        },
        lineMarkWrapperDouble: {
          marginTop: 4,
          width: windowWidth / 10,
          flexDirection: 'column',
        },
        lineNameWrapper: {
          flexDirection: 'row',
          flexWrap: 'wrap',
        },
        lineName: {
          fontWeight: 'bold',
          fontSize: 16,
        },
        lineNameLong: {
          fontWeight: 'bold',
          fontSize: 14,
        },
      });

      const containLongLineName = !!omittedTransferLines.find(
        (l) => getLocalizedLineName(l).length > 15
      );

      return (
        <View style={padLineMarksStyle.root}>
          {lineMarks.map((lm, i) =>
            lm ? (
              <View
                style={
                  lm.subSign
                    ? padLineMarksStyle.lineMarkWrapperDouble
                    : padLineMarksStyle.lineMarkWrapper
                }
                key={omittedTransferLines[i].id}
              >
                <TransferLineMark
                  line={omittedTransferLines[i]}
                  mark={lm}
                  small
                />
                <View style={padLineMarksStyle.lineNameWrapper}>
                  <Text
                    style={
                      containLongLineName
                        ? padLineMarksStyle.lineNameLong
                        : padLineMarksStyle.lineName
                    }
                  >
                    {getLocalizedLineName(omittedTransferLines[i])}
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={padLineMarksStyle.lineMarkWrapper}
                key={omittedTransferLines[i].id}
              >
                <TransferLineDot
                  key={omittedTransferLines[i].id}
                  line={omittedTransferLines[i]}
                  small
                />
                <Text
                  style={
                    containLongLineName
                      ? padLineMarksStyle.lineNameLong
                      : padLineMarksStyle.lineName
                  }
                >
                  {getLocalizedLineName(omittedTransferLines[i])}
                </Text>
              </View>
            )
          )}
        </View>
      );
    };

    return (
      <View
        key={station.name}
        onLayout={onLayout}
        style={styles.stationNameContainer}
      >
        <StationNamesWrapper index={index} station={station} passed={passed} />
        <LinearGradient
          colors={passed ? ['#ccc', '#dadada'] : ['#fdfbfb', '#ebedee']}
          style={styles.lineDot}
        >
          <View
            style={[
              styles.chevron,
              arrived ? styles.chevronArrived : undefined,
            ]}
          >
            {!index ? <Chevron /> : null}
          </View>
          <PadLineMarks />
        </LinearGradient>
      </View>
    );
  };

  const stationNameCellForMap = (s: Station, i: number): JSX.Element => (
    <StationNameCell key={s.groupId} station={s} index={i} />
  );
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={
          line
            ? [`#${line.lineColorC}d2`, `#${line.lineColorC}ff`]
            : ['#000000d2', '#000000ff']
        }
        style={styles.bar}
      />
      <View style={styles.barTerminal} />
      <View style={styles.stationNameWrapper}>
        {stations.map(stationNameCellForMap)}
      </View>
    </View>
  );
};

export default memo(LineBoardEast);