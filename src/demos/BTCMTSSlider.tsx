import {
  root,
  runOnBackground,
  // useMainThreadRef,
  useState,
} from '@lynx-js/react';
import { AppLayout } from '@/App';
import { sleep } from '@/utils/sleep';

import { HueSlider } from '@/components/btc-mts/MTSSlider';
// import type { Writer } from '@/components/btc-mts/MTSSlider';

if (__BACKGROUND__) {
  setInterval(() => {
    sleep(250);
  }, 100);
}

export function App() {
  const [value, setValue] = useState(199);

  // Uncomment `writeValue` to test BTC owned writer behavior.
  // const writeValue = useMainThreadRef<Writer<number>>();

  const handleChange = (next: number) => {
    'main thread';
    // writeValue.current?.(next);
    runOnBackground(setValue)(next);
  };

  return (
    <AppLayout title="BTC-MTS Slider" h={value} s={99} l={72}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <HueSlider
          initialValue={value}
          main-thread:onChange={handleChange}
          // main-thread:writeValue={writeValue}
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
