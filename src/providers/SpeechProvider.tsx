import React, { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import useValueRef from '../hooks/useValueRef';
import navigationState from '../store/atoms/navigation';
import stationState from '../store/atoms/station';
import { getNextStationLinesWithoutCurrentLine } from '../utils/line';
import lineState from '../store/atoms/line';
import {
  getNextInboundStopStation,
  getNextOutboundStopStation,
} from '../utils/nextStation';
import getSlicedStations from '../utils/slicedStations';
import getCurrentLine from '../utils/currentLine';
import themeState from '../store/atoms/theme';
import AppTheme from '../models/Theme';
import replaceSpecialChar from '../utils/replaceSpecialChar';
import { parenthesisRegexp } from '../constants/regexp';

type Props = {
  children: React.ReactNode;
  enabled: boolean;
};

const SpeechProvider: React.FC<Props> = ({ children, enabled }: Props) => {
  const { leftStations, headerState, trainType } = useRecoilValue(
    navigationState
  );
  const {
    selectedBound,
    station,
    stations,
    selectedDirection,
    arrived,
  } = useRecoilValue(stationState);
  const { selectedLine } = useRecoilValue(lineState);
  const { theme } = useRecoilValue(themeState);
  const prevStateText = useValueRef(headerState).current;

  const speech = useCallback(
    async ({ textJa, textEn }: { textJa: string; textEn: string }) => {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`;
      const bodyJa = {
        input: {
          ssml: `<speak><emphasis level="strong">${textJa}</emphasis></speak>`,
        },
        voice: {
          languageCode: 'ja-JP',
          name: 'ja-JP-Wavenet-B',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speaking_rate: 1.15,
          pitch: '0.00',
        },
      };
      const bodyEn = {
        input: {
          ssml: `<speak><emphasis level="strong">${textEn}</emphasis></speak>`,
        },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-F',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speaking_rate: 1.15,
          pitch: '0.00',
        },
      };
      try {
        const dataJa = await fetch(url, {
          headers: {
            'content-type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify(bodyJa),
          method: 'POST',
        });
        const resJa = await dataJa.json();
        const dataEn = await fetch(url, {
          headers: {
            'content-type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify(bodyEn),
          method: 'POST',
        });
        const resEn = await dataEn.json();
        const pathJa = `${FileSystem.documentDirectory}/announce_ja.aac`;
        await FileSystem.writeAsStringAsync(pathJa, resJa.audioContent, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const soundJa = new Audio.Sound();
        await soundJa.loadAsync({
          uri: pathJa,
        });
        await soundJa.playAsync();
        soundJa.setOnPlaybackStatusUpdate(
          async (status: AVPlaybackStatus & { didJustFinish: boolean }) => {
            if (status.didJustFinish) {
              await soundJa.unloadAsync();

              const soundEn = new Audio.Sound();
              const pathEn = `${FileSystem.documentDirectory}/announce_en.aac`;
              await FileSystem.writeAsStringAsync(pathEn, resEn.audioContent, {
                encoding: FileSystem.EncodingType.Base64,
              });
              await soundEn.loadAsync({
                uri: pathEn,
              });
              await soundEn.playAsync();

              soundEn.setOnPlaybackStatusUpdate(
                async (
                  _status: AVPlaybackStatus & { didJustFinish: boolean }
                ) => {
                  if (_status.didJustFinish) {
                    await soundEn.unloadAsync();
                  }
                }
              );
            }
          }
        );
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const actualNextStation = leftStations[1];

  const nextOutboundStopStation = getNextOutboundStopStation(
    stations,
    actualNextStation,
    station
  );
  const nextInboundStopStation = getNextInboundStopStation(
    stations,
    actualNextStation,
    station
  );

  const nextStation =
    selectedDirection === 'INBOUND'
      ? nextInboundStopStation
      : nextOutboundStopStation;

  const prevStateIsDifferent =
    prevStateText.split('_')[0] !== headerState.split('_')[0];

  const joinedLineIds = trainType?.lines.map((l) => l.id);
  const currentLine = getCurrentLine(leftStations, joinedLineIds, selectedLine);

  const slicedStations = getSlicedStations({
    stations,
    currentStation: leftStations[0],
    isInbound: selectedDirection === 'INBOUND',
    arrived,
    currentLine,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const playAsync = async () => {
      const nextStopStationIndex = slicedStations.findIndex((s) => {
        if (s.id === leftStations[0]?.id) {
          return false;
        }
        return !s.pass;
      });

      const nextLines = getNextStationLinesWithoutCurrentLine(
        slicedStations,
        currentLine,
        nextStopStationIndex
      );

      const lines = nextLines.map((l) => l.nameK);
      const linesEn = nextLines
        // J-Rにしないとジュニアと読まれちゃう
        .map((l) => l.nameR.replace(parenthesisRegexp, '').replace('JR', 'J-R'))
        .filter((nameR, idx, arr) => arr.indexOf(nameR) === idx)
        .map((nameR, i, arr) =>
          arr.length - 1 === i ? `and the ${nameR}` : `the ${nameR},`
        );

      // const belongingLines = stations.map((s) =>
      //   s.lines.find((l) => joinedLineIds?.find((il) => l.id === il))
      // );

      // const getFirstAnnounceJa = (): string => {
      //   const trainTypeName =
      //     trainType?.name?.replace(parenthesisRegexp, '') || '各駅停車';
      //   const reversedBelongingLines =
      //     selectedDirection === 'INBOUND'
      //       ? belongingLines
      //       : belongingLines.slice().reverse();
      //   const nextLineIndex = reversedBelongingLines.lastIndexOf(currentLine);
      //   const nextLine = reversedBelongingLines[nextLineIndex + 1];
      //   if (nextLine) {
      //     return `この電車は、${nextLine.name.replace(
      //       parenthesisRegexp,
      //       ''
      //     )}直通、${trainTypeName}、${selectedBound.name}方面ゆきです。`;
      //   }
      //   return `この電車は、${trainTypeName}、${selectedBound.name}方面ゆきです。`;
      // };

      // const getFirstAnnounceEn = (): string => {
      //   const trainTypeName =
      //     trainType?.nameR?.replace(parenthesisRegexp, '') || 'Local';
      //   const reversedBelongingLines =
      //     selectedDirection === 'INBOUND'
      //       ? belongingLines
      //       : belongingLines.slice().reverse();
      //   const nextLineIndex = reversedBelongingLines.lastIndexOf(currentLine);
      //   const nextLine = reversedBelongingLines[nextLineIndex + 1];
      //   if (nextLine) {
      //     switch (theme) {
      //       case AppTheme.TY:
      //         return `This train will merge and continue traveling at the ${trainTypeName} on the ${nextLine.nameR
      //           .replace('JR', 'J-R')
      //           .replace(parenthesisRegexp, '')} to ${replaceSpecialChar(
      //           selectedBound.nameR
      //         )}.`;
      //       case AppTheme.Yamanote:
      //       case AppTheme.Saikyo:
      //         return `This is a ${currentLine.nameR
      //           .replace('JR', 'J-R')
      //           .replace(
      //             parenthesisRegexp,
      //             ''
      //           )} train ${trainTypeName} for ${replaceSpecialChar(
      //           selectedBound.nameR
      //         )} via the ${nextLine.nameR
      //           .replace('JR', 'J-R')
      //           .replace(parenthesisRegexp, '')}.`;
      //       default:
      //         return `This train is going to the ${currentLine.nameR
      //           .replace('JR', 'J-R')
      //           .replace(parenthesisRegexp, '')}. The final destination is ${
      //           selectedBound.nameR
      //         }.`;
      //     }
      //   }
      //   switch (theme) {
      //     case AppTheme.TY:
      //       return `This train will merge and continue traveling at the ${trainTypeName} to ${replaceSpecialChar(
      //         selectedBound.nameR
      //       )}.`;
      //     case AppTheme.Yamanote:
      //     case AppTheme.Saikyo:
      //       return `This is a ${currentLine.nameR
      //         .replace('JR', 'J-R')
      //         .replace(
      //           parenthesisRegexp,
      //           ''
      //         )} train ${trainTypeName} for ${replaceSpecialChar(
      //         selectedBound.nameR
      //       )}.`;
      //     default:
      //       return `This train is going to the ${currentLine.nameR
      //         .replace('JR', 'J-R')
      //         .replace(parenthesisRegexp, '')}. The final destination is ${
      //         selectedBound.nameR
      //       }.`;
      //   }
      // };

      const getNextTextJaBase = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
            return `次は、<break strength="weak"/>${nextStation.nameK}、${
              terminal ? '終点' : ''
            }です。`;
          case AppTheme.TY:
            return `次は、<break strength="weak"/>${
              terminal ? '終点' : ''
            }<break strength="weak"/>${nextStation.nameK}に止まります。`;
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `次は、<break strength="weak"/>${
              terminal ? '終点' : ''
            }<break strength="weak"/>${nextStation.nameK}、${
              nextStation.nameK
            }。`;
          default:
            return `次は、<break strength="weak"/>${nextStation.nameK}、${
              terminal ? '終点' : ''
            }です。`;
        }
      };

      const getNextTextJaWithTransfers = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
          case AppTheme.TY:
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `${getNextTextJaBase(
              terminal
            )}<break strength="medium"/>${lines.join(
              '、'
            )}は、お乗り換えです。`;
          default:
            return `${getNextTextJaBase(
              terminal
            )}<break strength="medium"/>${lines.join(
              '、'
            )}は、お乗り換えです。`;
        }
      };

      const getApproachingTextJaBase = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
            return `まもなく<break strength="weak"/>${nextStation.nameK}${
              terminal ? 'この電車の終点' : ''
            }です。`;
          case AppTheme.TY:
            return `まもなく<break strength="weak"/>${nextStation.nameK}に到着いたします。`;
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `まもなく${terminal ? '終点' : ''}<break strength="weak"/>${
              nextStation.nameK
            }、${nextStation.nameK}。`;
          default:
            return `まもなく<break strength="weak"/>${nextStation.nameK}${
              terminal ? 'この電車の終点' : ''
            }です。`;
        }
      };

      const getApproachingTextJaWithTransfers = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
          case AppTheme.TY:
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `${getApproachingTextJaBase(terminal)}${lines.join(
              '、'
            )}は、お乗り換えです。`;
          default:
            return `${getApproachingTextJaBase(terminal)}${lines.join(
              '、'
            )}は、お乗り換えです。`;
        }
      };

      const nameR = replaceSpecialChar(nextStation?.nameR);

      const getNextTextEnBase = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
            return `The next stop is<break strength="weak"/>${nameR} ${
              terminal ? 'terminal' : ''
            }.`;
          case AppTheme.TY:
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `The next station is<break strength="weak"/>${nameR} ${
              terminal ? 'terminal' : ''
            }.`;
          default:
            return `The next station is<break strength="weak"/>${nameR} ${
              terminal ? 'terminal' : ''
            }.`;
        }
      };

      const getNextTextEnWithTransfer = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `${getNextTextEnBase(
              terminal
            )} Please change here for ${linesEn.join('')}.`;
          case AppTheme.TY:
            return `${getNextTextEnBase(
              terminal
            )}Passengers changing to the ${linesEn.join(
              ''
            )}, Please transfer at this station.`;
          default:
            return `${getNextTextEnBase(
              terminal
            )} Please change here for ${linesEn.join('')}`;
        }
      };

      const getApproachingTextEnBase = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
            return `Arriving at ${nameR}.`;
          case AppTheme.TY:
            return `We will soon make a brief stop at ${nameR}.`;
          case AppTheme.Yamanote:
          case AppTheme.Saikyo:
            return `${getNextTextEnBase(terminal)}${
              terminal
                ? 'Thank you for traveling with us. And we look forward to serving you again!'
                : ''
            }`;
          default:
            return `Arriving at ${nameR}.`;
        }
      };

      const getApproachingTextEnWithTransfers = (terminal: boolean): string => {
        switch (theme) {
          case AppTheme.TokyoMetro:
            return getApproachingTextEnBase(terminal);
          case AppTheme.TY:
            return `${getApproachingTextEnBase(
              terminal
            )}Passengers changing to the ${linesEn.join(
              ''
            )}, Please transfer at this station.`;
          default:
            return getApproachingTextEnBase(terminal);
        }
      };

      const nextStationIndex = stations.findIndex(
        (s) => s.id === nextStation?.id
      );
      console.log(stations.length - 1, nextStationIndex);
      const nextStationIsTerminus =
        selectedDirection === 'INBOUND'
          ? stations.length - 1 === nextStationIndex
          : nextStationIndex === 0;

      if (prevStateIsDifferent) {
        switch (headerState) {
          case 'NEXT':
            if (lines.length) {
              speech({
                // text: getFirstAnnounceJa() + getNextTextJaWithTransfers(),
                textJa: getNextTextJaWithTransfers(nextStationIsTerminus),
                textEn: getNextTextEnWithTransfer(nextStationIsTerminus),
              });
              return;
            }
            speech({
              // text: getFirstAnnounceJa() + getNextTextJaBase(),
              textJa: getNextTextJaBase(nextStationIsTerminus),
              textEn: getNextTextEnBase(nextStationIsTerminus),
            });
            break;
          case 'ARRIVING':
            if (lines.length) {
              speech({
                textJa: getApproachingTextJaWithTransfers(
                  nextStationIsTerminus
                ),
                textEn: getApproachingTextEnWithTransfers(
                  nextStationIsTerminus
                ),
              });
              return;
            }
            speech({
              textJa: getApproachingTextJaBase(nextStationIsTerminus),
              textEn: getApproachingTextEnBase(nextStationIsTerminus),
            });
            break;
          default:
            break;
        }
      }
    };

    playAsync();
  }, [
    currentLine,
    enabled,
    headerState,
    joinedLineIds,
    leftStations,
    nextStation,
    prevStateIsDifferent,
    prevStateText,
    selectedBound?.name,
    selectedBound?.nameR,
    selectedDirection,
    selectedLine,
    slicedStations,
    speech,
    stations,
    theme,
    trainType,
    trainType?.name,
    trainType?.nameR,
  ]);

  return <>{children}</>;
};

export default SpeechProvider;