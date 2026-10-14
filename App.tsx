import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  Alert,
  Platform,
  AppState,
  AppStateStatus,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';

// BLE Configuration
const SERVICE_UUID = '0000FFF0-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = '0000FFF1-0000-1000-8000-00805F9B34FB';
const ENTER_THRESHOLD = -80; // dBm - closer/stronger signal
const EXIT_THRESHOLD = -90; // dBm - farther/weaker signal
const RSSI_SAMPLE_SIZE = 10; // rolling average window

interface PeerData {
  id: string;
  name: string;
  rssi: number;
  rssiHistory: number[];
  rssiAverage: number;
  insideThreshold: boolean;
  lastSeen: number;
}

interface LogEntry {
  timestamp: string;
  peerId: string;
  rssi: number;
  average: number;
  insideThreshold: boolean;
  note?: string;
}

export default function App() {
  const bleManager = useRef<BleManager>(new BleManager()).current;
  const [bleState, setBleState] = useState<State>(State.Unknown);
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [peers, setPeers] = useState<Map<string, PeerData>>(new Map());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [appStartTime] = useState(Date.now());
  const [firstDiscoveryTime, setFirstDiscoveryTime] = useState<number | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [deviceId] = useState(ExpoDevice.modelId || 'unknown');
  const [noteText, setNoteText] = useState('');

  // Track app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      addLog('APP_STATE', 0, 0, false, `State: ${nextAppState}`);
    });

    return () => subscription.remove();
  }, []);

  // Initialize BLE
  useEffect(() => {
    const subscription = bleManager.onStateChange((state) => {
      setBleState(state);
      if (state === State.PoweredOn) {
        startBLE();
      }
    }, true);

    return () => {
      subscription.remove();
      bleManager.stopDeviceScan();
      bleManager.destroy();
    };
  }, []);

  const addLog = (
    peerId: string,
    rssi: number,
    average: number,
    insideThreshold: boolean,
    note?: string
  ) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      peerId,
      rssi,
      average,
      insideThreshold,
      note,
    };
    setLogs((prev) => [...prev, entry]);

    // Also log to console for debugging
    console.log(`[${entry.timestamp}] ${peerId}: ${rssi}dBm (avg: ${average.toFixed(1)}dBm) ${insideThreshold ? 'INSIDE' : 'OUTSIDE'} ${note || ''}`);
  };

  const startBLE = async () => {
    if (Platform.OS === 'ios') {
      try {
        // Start scanning
        startScanning();

        // Note: iOS doesn't support BLE peripheral mode advertising in the background
        // for custom services in standard apps. For this spike, we'll rely on scanning.
        setIsAdvertising(true);
        addLog('SYSTEM', 0, 0, false, 'iOS: Advertising limited by OS. Use Android for full peripheral mode.');
      } catch (error) {
        console.error('BLE start error:', error);
        Alert.alert('Error', `Failed to start BLE: ${error}`);
      }
    }
  };

  const startScanning = () => {
    addLog('SYSTEM', 0, 0, false, 'Starting BLE scan...');
    setIsScanning(true);

    bleManager.startDeviceScan(null, { allowDuplicates: true }, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        return;
      }

      if (device && device.rssi) {
        updatePeer(device);
      }
    });
  };

  const updatePeer = (device: Device) => {
    const now = Date.now();

    // Record first discovery time
    if (!firstDiscoveryTime) {
      const timeToDiscovery = now - appStartTime;
      setFirstDiscoveryTime(timeToDiscovery);
      addLog('DISCOVERY', 0, 0, false, `First peer discovered in ${(timeToDiscovery / 1000).toFixed(1)}s`);
    }

    setPeers((prev) => {
      const updated = new Map(prev);
      const existing = updated.get(device.id);

      // Calculate rolling average
      const rssiHistory = existing
        ? [...existing.rssiHistory, device.rssi!].slice(-RSSI_SAMPLE_SIZE)
        : [device.rssi!];

      const rssiAverage =
        rssiHistory.reduce((sum, val) => sum + val, 0) / rssiHistory.length;

      // Hysteresis: only change state if we cross the appropriate threshold
      let insideThreshold = existing?.insideThreshold || false;

      if (!existing) {
        // First time seeing this device - use enter threshold
        insideThreshold = rssiAverage >= ENTER_THRESHOLD;
      } else if (existing.insideThreshold) {
        // Currently inside - only exit if we drop below EXIT_THRESHOLD
        insideThreshold = rssiAverage >= EXIT_THRESHOLD;
      } else {
        // Currently outside - only enter if we rise above ENTER_THRESHOLD
        insideThreshold = rssiAverage >= ENTER_THRESHOLD;
      }

      // Log state changes
      if (!existing || existing.insideThreshold !== insideThreshold) {
        addLog(
          device.id,
          device.rssi!,
          rssiAverage,
          insideThreshold,
          insideThreshold ? 'ENTERED' : 'EXITED'
        );
      }

      const peerData: PeerData = {
        id: device.id,
        name: device.name || device.localName || 'Unknown',
        rssi: device.rssi!,
        rssiHistory,
        rssiAverage,
        insideThreshold,
        lastSeen: now,
      };

      updated.set(device.id, peerData);
      return updated;
    });
  };

  const addNote = () => {
    if (!noteText.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }
    addLog('MARKER', 0, 0, false, noteText.trim());
    setNoteText('');
    Alert.alert('Note Added', noteText.trim());
  };

  const clearLogs = () => {
    setLogs([]);
    Alert.alert('Logs Cleared');
  };

  const exportLogs = () => {
    const csv = [
      'Timestamp,PeerID,RSSI,Average,InsideThreshold,Note',
      ...logs.map(
        (log) =>
          `${log.timestamp},${log.peerId},${log.rssi},${log.average.toFixed(1)},${log.insideThreshold},${log.note || ''}`
      ),
    ].join('\n');

    console.log('=== EXPORTED LOGS ===');
    console.log(csv);
    console.log('=== END LOGS ===');

    Alert.alert(
      'Logs Exported',
      `${logs.length} entries logged to console. Copy from Xcode or Metro terminal.`,
      [{ text: 'OK' }]
    );
  };

  const getTimeSinceStart = () => {
    const seconds = (Date.now() - appStartTime) / 1000;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAppStateColor = () => {
    if (appState === 'active') return '#00FF00';
    if (appState === 'background') return '#FFA500';
    return '#FF0000';
  };

  // Clean up stale peers (not seen in 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPeers((prev) => {
        const updated = new Map(prev);
        for (const [id, peer] of updated) {
          if (now - peer.lastSeen > 10000) {
            updated.delete(id);
            addLog(id, 0, 0, false, 'TIMEOUT - removed');
          }
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const peerArray = Array.from(peers.values()).sort((a, b) => b.rssi - a.rssi);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BLE PROXIMITY SPIKE</Text>
        <View style={styles.statusRow}>
          <Text style={styles.status}>
            BLE: {bleState === State.PoweredOn ? '✓' : '✗'}
          </Text>
          <Text style={styles.status}>
            Scan: {isScanning ? '✓' : '✗'}
          </Text>
          <Text style={[styles.status, { color: getAppStateColor() }]}>
            {appState.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.deviceId}>Device: {deviceId}</Text>
        <Text style={styles.time}>Runtime: {getTimeSinceStart()}</Text>
        {firstDiscoveryTime && (
          <Text style={styles.discovery}>
            First discovery: {(firstDiscoveryTime / 1000).toFixed(1)}s
          </Text>
        )}
      </View>

      {/* Peers */}
      <ScrollView style={styles.peerList}>
        {peerArray.length === 0 ? (
          <Text style={styles.noPeers}>No peers found yet...</Text>
        ) : (
          peerArray.map((peer) => (
            <View
              key={peer.id}
              style={[
                styles.peerCard,
                { backgroundColor: peer.insideThreshold ? '#00FF0020' : '#FF000020' },
              ]}
            >
              <Text style={styles.peerName} numberOfLines={1}>
                {peer.name}
              </Text>
              <Text style={styles.peerId} numberOfLines={1}>
                {peer.id}
              </Text>
              <View style={styles.rssiRow}>
                <Text style={styles.rssiCurrent}>{peer.rssi} dBm</Text>
                <Text style={styles.rssiAverage}>
                  avg: {peer.rssiAverage.toFixed(1)} dBm
                </Text>
              </View>
              <Text
                style={[
                  styles.threshold,
                  { color: peer.insideThreshold ? '#00FF00' : '#FF0000' },
                ]}
              >
                {peer.insideThreshold ? '✓ INSIDE' : '✗ OUTSIDE'}
              </Text>
              <Text style={styles.thresholdInfo}>
                Enter: {ENTER_THRESHOLD}dBm / Exit: {EXIT_THRESHOLD}dBm
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.logCount}>Logs: {logs.length}</Text>

        {/* Note Input */}
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Test condition (e.g., Test 1 - 20 yards)"
            placeholderTextColor="#666"
            value={noteText}
            onChangeText={setNoteText}
            returnKeyType="done"
            onSubmitEditing={addNote}
          />
          <TouchableOpacity style={styles.noteButton} onPress={addNote}>
            <Text style={styles.noteButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <Button title="Export Logs" onPress={exportLogs} />
          <Button title="Clear Logs" onPress={clearLogs} color="#FF0000" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#00FF00',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FF00',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  status: {
    fontSize: 18,
    color: '#00FF00',
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  time: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 5,
  },
  discovery: {
    fontSize: 14,
    color: '#00FF00',
    textAlign: 'center',
    marginTop: 5,
  },
  peerList: {
    flex: 1,
    padding: 10,
  },
  noPeers: {
    fontSize: 24,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  peerCard: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#00FF00',
  },
  peerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  peerId: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  rssiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rssiCurrent: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00FFFF',
  },
  rssiAverage: {
    fontSize: 24,
    color: '#FFF',
    alignSelf: 'flex-end',
  },
  threshold: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  thresholdInfo: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#00FF00',
  },
  logCount: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  noteContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    color: '#FFF',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FF00',
  },
  noteButton: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  noteButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
