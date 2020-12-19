//
//  ContentView.swift
//  WatchApp Extension
//
//  Created by TinyKitten on 2020/12/15.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ContentView: View {
  @ObservedObject var connector = ConnectivityProvider()

  @ViewBuilder
  var body: some View {
    if let station = connector.receivedStation {
      TabView {
        RootView(
          state: connector.receivedState ?? "",
          station: station
          )
        StationListView(
          stations: connector.receivedStationList,
          lineColor: connector.selectedLine?.lineColorC ?? "#000"
        )
      }.tabViewStyle(PageTabViewStyle())
    } else {
      NotLaunchView()
    }
  }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
      ContentView()
    }
}
