import { root, useCallback, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';

import { HueSlider } from '@/components/btc/Slider';
import { sleep } from '@/utils/sleep';

if (__BACKGROUND__) {
  setInterval(() => {
    sleep(150);
  }, 100);
}

export function App() {
  const [value, setValue] = useState(199);

  const onChange = useCallback((next: number) => {
    setValue(next);
  }, []);

  return (
    <AppLayout title="BTC Slider" h={value} s={99} l={72}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <HueSlider initialValue={value} onChange={onChange} s={99} l={72} />
      </view>
    </AppLayout>
  );
}

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
