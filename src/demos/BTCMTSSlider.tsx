import { root, runOnBackground, useCallback, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';

import { HueSlider } from '@/components/btc-mts-slider/MTSSlider';

export function App() {
  const [value, setValue] = useState(200);

  const onMTSValueChange = useCallback((next: number) => {
    'main thread';
    console.log('updating app value...');
    runOnBackground(setValue)(next);
  }, []);

  return (
    <AppLayout title="BTC-MTS Slider" h={value} s={100} l={50}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <HueSlider initialValue={value} onMTSChange={onMTSValueChange} />
      </view>
    </AppLayout>
  );
}

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
