import {
  root,
  runOnBackground,
  //useMainThreadRef,
  useCallback,
  useState,
} from '@lynx-js/react';
import { AppLayout } from '@/App';
import { sleep } from '@/utils/sleep';

import { HueSlider } from '@/components/btc-mts/MTSSlider';
// import type { MTSWriterWithControls } from '@/components/btc-mts-slider/MTSSlider';

if (__BACKGROUND__) {
  setInterval(() => {
    sleep(250);
  }, 100);
}

export function App() {
  const [value, setValue] = useState(199);

  // Uncomment `mtsWriteValue` to test BTC owned writer behavior.
  // const mtsWriteValue = useMainThreadRef<MTSWriterWithControls<number>>();

  const onMTSValueChange = useCallback((next: number) => {
    'main thread';
    //mtsWriteValue.current?.(next);
    runOnBackground(setValue)(next);
  }, []);

  return (
    <AppLayout title="BTC-MTS Slider" h={value} s={99} l={72}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <HueSlider
          initialValue={value}
          onMTSChange={onMTSValueChange}
          // mtsWriteValue={mtsWriteValue}
          initialSL={[99, 72]}
        />
      </view>
    </AppLayout>
  );
}

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
