import { root, runOnBackground, useCallback, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';
import { sleep } from '@/utils/sleep';

import { ColorPicker } from '@/components/btc-mts/MTSColorPicker';

if (__BACKGROUND__) {
  setInterval(() => {
    sleep(250);
  }, 100);
}

export function App() {
  const [value, setValue] = useState<readonly [number, number, number]>([
    199, 99, 72,
  ]);

  const handleChange = useCallback(
    (next: readonly [number, number, number]) => {
      'main thread';
      runOnBackground(setValue)(next);
    },
    [],
  );

  return (
    <AppLayout
      title="BTC-MTS ColorPicker"
      subtitle="Coordinate on MTS"
      h={value[0]}
      s={value[1]}
      l={value[2]}
    >
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-48">
        <ColorPicker initialValue={value} main-thread:onChange={handleChange} />
      </view>
    </AppLayout>
  );
}

root.render(<App />);
