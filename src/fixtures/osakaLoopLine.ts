import { Station, Line } from '../models/StationAPI';

export const osakaLoopLineFixture: Line = {
  __typename: 'Line',
  companyId: 4,
  id: '11623',
  lineColorC: 'FF0000',
  lineType: 2,
  name: '大阪環状線',
  nameR: 'Osaka Loop Line',
};

export const mockOsakaLoopLineStations: Station[] = [
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市天王寺区悲田院町',
    groupId: 1160719,
    id: '1162301',
    latitude: 34.647243,
    longitude: 135.514124,
    name: '天王寺',
    nameK: 'テンノウジ',
    nameR: 'Tennoji',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市浪速区恵美須西３丁目',
    groupId: 1160720,
    id: '1162302',
    latitude: 34.650149,
    longitude: 135.501076,
    name: '新今宮',
    nameK: 'シンイマミヤ',
    nameR: 'Shin-Imamiya',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市浪速区大国３丁目',
    groupId: 1160721,
    id: '1162303',
    latitude: 34.654156,
    longitude: 135.492975,
    name: '今宮',
    nameK: 'イマミヤ',
    nameR: 'Imamiya',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市浪速区浪速東１丁目',
    groupId: 1162304,
    id: '1162304',
    latitude: 34.658608,
    longitude: 135.48924,
    name: '芦原橋',
    nameK: 'アシハラバシ',
    nameR: 'Ashiharabashi',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市大正区三軒家東１丁目',
    groupId: 1162305,
    id: '1162305',
    latitude: 34.665582,
    longitude: 135.479932,
    name: '大正',
    nameK: 'タイショウ',
    nameR: 'Taisho',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市港区波除３丁目',
    groupId: 1162306,
    id: '1162306',
    latitude: 34.669403,
    longitude: 135.462348,
    name: '弁天町',
    nameK: 'ベンテンチョウ',
    nameR: 'Bentencho',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市此花区西九条１丁目',
    groupId: 1162307,
    id: '1162307',
    latitude: 34.68269,
    longitude: 135.466779,
    name: '西九条',
    nameK: 'ニシクジョウ',
    nameR: 'Nishikujo',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市福島区海老江一丁目',
    groupId: 1162308,
    id: '1162308',
    latitude: 34.689069,
    longitude: 135.474837,
    name: '野田',
    nameK: 'ノダ',
    nameR: 'Noda',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市福島区福島７丁目',
    groupId: 1162309,
    id: '1162309',
    latitude: 34.697167,
    longitude: 135.486563,
    name: '福島',
    nameK: 'フクシマ',
    nameR: 'Fukushima',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市北区梅田３丁目',
    groupId: 1160214,
    id: '1162310',
    latitude: 34.702398,
    longitude: 135.495188,
    name: '大阪',
    nameK: 'オオサカ',
    nameR: 'Osaka',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市北区錦町',
    groupId: 1162311,
    id: '1162311',
    latitude: 34.704923,
    longitude: 135.512233,
    name: '天満',
    nameK: 'テンマ',
    nameR: 'Temma',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市都島区中野町５丁目',
    groupId: 1162312,
    id: '1162312',
    latitude: 34.704976,
    longitude: 135.520944,
    name: '桜ノ宮',
    nameK: 'サクラノミヤ',
    nameR: 'Sakuranomiya',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市城東区新喜多一丁目2-31',
    groupId: 1161724,
    id: '1162313',
    latitude: 34.696047,
    longitude: 135.534253,
    name: '京橋',
    nameK: 'キョウバシ',
    nameR: 'Kyobashi',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市中央区大阪城',
    groupId: 1162314,
    id: '1162314',
    latitude: 34.68858,
    longitude: 135.534482,
    name: '大阪城公園',
    nameK: 'オオサカジョウコウエン',
    nameR: 'Osakajokoen',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市中央区森ノ宮中央１丁目',
    groupId: 1162315,
    id: '1162315',
    latitude: 34.680412,
    longitude: 135.533996,
    name: '森ノ宮',
    nameK: 'モリノミヤ',
    nameR: 'Morinomiya',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市天王寺区玉造元町',
    groupId: 1162316,
    id: '1162316',
    latitude: 34.673559,
    longitude: 135.532901,
    name: '玉造',
    nameK: 'タマツクリ',
    nameR: 'Tamatsukuri',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市天王寺区下味原町',
    groupId: 1162317,
    id: '1162317',
    latitude: 34.665264,
    longitude: 135.530133,
    name: '鶴橋',
    nameK: 'ツルハシ',
    nameR: 'Tsuruhashi',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市天王寺区堂ケ芝１丁目',
    groupId: 1162318,
    id: '1162318',
    latitude: 34.658453,
    longitude: 135.527908,
    name: '桃谷',
    nameK: 'モモダニ',
    nameR: 'Momodani',
    prefId: 27,
  },
  {
    __typename: 'Station',
    lines: [osakaLoopLineFixture],
    address: '大阪府大阪市天王寺区大道４丁目',
    groupId: 1162319,
    id: '1162319',
    latitude: 34.647957,
    longitude: 135.523437,
    name: '寺田町',
    nameK: 'テラダチョウ',
    nameR: 'Teradacho',
    prefId: 27,
  },
];